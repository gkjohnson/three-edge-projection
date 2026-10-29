import { BackSide, DoubleSide, FrontSide } from 'three';
import { StructTypeNode } from 'three/webgpu';
import { BVHComputeData, wgslTagFn, bvhNodeBoundsStruct } from 'three-mesh-bvh/webgpu';
import { transformBVHBounds } from './nodes/utils.wgsl.js';
import { constants as overlapConstants } from './nodes/common.wgsl.js';
import { getProjectedOverlapRange, isLineTriangleEdge, trimToBeneathTriPlane } from './nodes/overlapFunctions.wgsl.js';
import { LineWGSL, TriWGSL } from './nodes/primitives.js';

// Shape struct carrying world-space line endpoints plus the object-to-world
// matrix (set by transformShapeFn; identity at top level so world-space
// bounds pass through unchanged) and the transform buffer index.
const edgeLineShapeStruct = new StructTypeNode( {
	worldStart: 'vec3f',
	worldEnd: 'vec3f',
	matrixWorld: 'mat4x4f',
	objectIndex: 'uint',
	edgeIndex: 'uint',
}, 'EdgeLineShape' );

// Extended transform struct that adds a per-object "side" field for back-face
// culling. Values: 0 = DoubleSide (no cull), 1 = FrontSide, -1 = BackSide.
const projectionTransformStruct = new StructTypeNode( {
	matrixWorld: 'mat4x4f',
	inverseMatrixWorld: 'mat4x4f',
	visible: 'uint',
	side: 'int',
	_alignment0: 'uint',
	_alignment1: 'uint',
}, 'ProjectionTransformStruct' );

// Projection-generator-specific BVHComputeData that only requires position
// attributes and auto-generates missing BVHs.
export class ProjectionGeneratorBVHComputeData extends BVHComputeData {

	constructor( bvh, options = {} ) {

		super( bvh, {
			attributes: { position: 'vec4f' },
			...options,
		} );

		this.bvhMap = new Map();
		this.structs.transform = projectionTransformStruct;
		this._sharedFns = null;
		this._fns = null;

	}

	writeTransformData( info, premultiplyMatrix, writeOffset, targetBuffer ) {

		super.writeTransformData( info, premultiplyMatrix, writeOffset, targetBuffer );

		const { object, root } = info;
		let material = object.material;
		if ( Array.isArray( material ) ) {

			material = material[ object.geometry.groups[ root ].materialIndex ];

		}

		let sideValue;
		switch ( material.side ) {

			case DoubleSide:
				sideValue = 0;
				break;
			case FrontSide:
				sideValue = 1;
				break;
			case BackSide:
				sideValue = - 1;
				break;

		}

		const transformBufferU32 = new Uint32Array( targetBuffer );
		transformBufferU32[ writeOffset * projectionTransformStruct.getLength() + 33 ] = sideValue;

	}

	update() {

		super.update();
		this.bvhMap.clear();
		this._sharedFns = null;
		this._fns = null;

	}

	// Returns a WGSL function — fn traverse( edgeIndex, lineStart, lineEnd ) -> void —
	// that traverses the BVH for one edge and writes qualifying { edgeIndex, objectIndex, triIndex }
	// records to the pairs buffer using atomic slot claiming.
	//
	// pairsCountsStorage is a 2-element array<atomic<u32>>:
	//   [0] write offset — claimed unconditionally via atomicAdd
	//   [1] dispatch count — incremented only when the claimed slot is within capacity; equals
	//       the number of valid pair records written and is used as K3's dispatch bound
	//
	// overflowFlagStorage is a 1-element array<atomic<u32>> that accumulates the number of
	// pairs that could not be written due to buffer overflow.
	//
	// NOTE: pairsCountsStorage must be bound as array<atomic<u32>> (read_write storage).
	getCollectEdgeOverlapsFn( { overlapsStorage, bufferPointersStorage, overflowFlagStorage } ) {

		const { storage } = this;
		const { DOUBLE_SIDE, BACK_SIDE, DIST_THRESHOLD } = overlapConstants;

		const intersectsBoundsFn = wgslTagFn/* wgsl */`
			fn intersectsBounds( shape: ${ edgeLineShapeStruct }, bounds: ${ bvhNodeBoundsStruct } ) -> u32 {

				// TODO: a proper 3D Line / AABB check with the bottom of the bounds extended downward
				// would be best here since we are getting some false positives.

				// Transform bounds to world space. At the top level the shape matrix
				// is identity, so world-space bounds pass through unchanged.
				let aabb = ${ transformBVHBounds }( bounds, shape.matrixWorld );
				let aabbMin = vec3( aabb.min[ 0 ], aabb.min[ 1 ], aabb.min[ 2 ] );
				let aabbMax = vec3( aabb.max[ 0 ], aabb.max[ 1 ], aabb.max[ 2 ] );

				// Y-cull: bounds entirely below the line
				if ( aabbMax.y <= min( shape.worldStart.y, shape.worldEnd.y ) ) {

					return 0u;

				}

				// AABB vs AABB test
				let lineMinX = min( shape.worldStart.x, shape.worldEnd.x );
				let lineMaxX = max( shape.worldStart.x, shape.worldEnd.x );
				let lineMinZ = min( shape.worldStart.z, shape.worldEnd.z );
				let lineMaxZ = max( shape.worldStart.z, shape.worldEnd.z );
				if (
					aabbMax.x < lineMinX || aabbMin.x > lineMaxX ||
					aabbMax.z < lineMinZ || aabbMin.z > lineMaxZ
				) {

					return 0u;

				}

				// edge SAT axis
				let segDelta = shape.worldEnd.xz - shape.worldStart.xz;
				let segNormal = vec2f( - segDelta.y, segDelta.x );
				let segProj = dot( segNormal, vec2f( shape.worldStart.x, shape.worldStart.z ) );

				let aabbCenter = ( aabbMin.xz + aabbMax.xz ) * 0.5;
				let aabbHalf = ( aabbMax.xz - aabbMin.xz ) * 0.5;

				let aabbCenterProj = dot( segNormal, aabbCenter );
				let aabbHalfProj = dot( abs( segNormal ), aabbHalf );

				if ( abs( aabbCenterProj - segProj ) > aabbHalfProj ) {

					return 0u;

				}

				return 1u;

			}
		`;

		const transformShapeFn = wgslTagFn/* wgsl */`
			fn transformShape( localShape: ptr<function, ${ edgeLineShapeStruct }>, objectIndex: u32 ) -> void {

				localShape.matrixWorld = ${ storage.transforms }[ objectIndex ].matrixWorld;
				localShape.objectIndex = objectIndex;

			}
		`;

		const intersectRangeFn = wgslTagFn/* wgsl */`
			fn traverseRange( shape: ${ edgeLineShapeStruct }, offset: u32, count: u32 ) -> bool {

				var tri: ${ TriWGSL.struct };
				var line: ${ LineWGSL.struct };
				line.start = shape.worldStart;
				line.end = shape.worldEnd;

				let lineMinY = min( line.start.y, line.end.y );
				let lineMaxY = max( line.start.y, line.end.y );

				let matrixWorld = shape.matrixWorld;
				let side = ${ storage.transforms }[ shape.objectIndex ].side;
				let inverted = determinant( matrixWorld ) < 0.0;

				for ( var ti = offset; ti < offset + count; ti = ti + 1u ) {

					let i0 = ${ storage.index }[ ti * 3u + 0u ];
					let i1 = ${ storage.index }[ ti * 3u + 1u ];
					let i2 = ${ storage.index }[ ti * 3u + 2u ];

					let ta = matrixWorld * vec4f( ${ storage.attributes }[ i0 ].position.xyz, 1.0 );
					let tb = matrixWorld * vec4f( ${ storage.attributes }[ i1 ].position.xyz, 1.0 );
					let tc = matrixWorld * vec4f( ${ storage.attributes }[ i2 ].position.xyz, 1.0 );
					tri.a = ta.xyz / ta.w;
					tri.b = tb.xyz / tb.w;
					tri.c = tc.xyz / tc.w;

					// back-face cull
					if ( side != ${ DOUBLE_SIDE } ) {

						let triNormal = ${ TriWGSL.getNormal }( tri );
						let faceUp = ( triNormal.y > 0.0 ) != inverted;
						if ( faceUp == ( side == ${ BACK_SIDE } ) ) {

							continue;

						}

					}

					let triMaxY = max( max( tri.a.y, tri.b.y ), tri.c.y );
					let triMinY = min( min( tri.a.y, tri.b.y ), tri.c.y );

					// skip triangles entirely below the edge
					if ( triMaxY <= lineMinY ) {

						continue;

					}

					// skip if the edge lies on this triangle
					if ( ${ isLineTriangleEdge }( tri, line ) ) {

						continue;

					}

					// trim edge to the portion below the triangle plane; if the
					// entire line is already below the triangle, use the full line
					var beneathLine: ${ LineWGSL.struct };
					if ( lineMaxY < triMinY ) {

						beneathLine = line;

					} else if ( ! ${ trimToBeneathTriPlane }( tri, line, &beneathLine ) ) {

						continue;

					}

					// skip degenerate trimmed segments
					// TODO: add a "distant" utility function
					if ( length( beneathLine.end - beneathLine.start ) < ${ DIST_THRESHOLD } ) {

						continue;

					}

					var overlapLine: ${ LineWGSL.struct };
					if ( ! ${ getProjectedOverlapRange }( beneathLine, tri, &overlapLine ) ) {

						continue;

					}

					// compute t0/t1 parametric positions along the original edge
					let lineDir = line.end - line.start;
					let lineLen = length( lineDir );
					var t0 = length( overlapLine.start - line.start ) / lineLen;
					var t1 = length( overlapLine.end - line.start ) / lineLen;
					t0 = clamp( t0, 0.0, 1.0 );
					t1 = clamp( t1, 0.0, 1.0 );

					if ( abs( t0 - t1 ) <= ${ DIST_THRESHOLD } ) {

						continue;

					}

					// claim a slot and write the overlap record directly
					let slot = atomicAdd( &${ bufferPointersStorage }[ 0 ], 1u );
					if ( slot < arrayLength( &${ overlapsStorage } ) ) {

						${ overlapsStorage }[ slot ].edgeIndex = shape.edgeIndex;
						${ overlapsStorage }[ slot ].t0 = t0;
						${ overlapsStorage }[ slot ].t1 = t1;

					} else {

						atomicAdd( &${ overflowFlagStorage }[ 0 ], 1u );

					}

				}

				return false;

			}
		`;

		const traversalFn = this.getShapecastFn( {
			name: 'collectEdgeOverlaps',
			shapeStruct: edgeLineShapeStruct,
			intersectsBoundsFn,
			intersectRangeFn,
			transformShapeFn,
		} );

		return wgslTagFn/* wgsl */`
			fn traverse( edgeIndex: u32, lineStart: vec3f, lineEnd: vec3f ) -> void {

				var shape: ${ edgeLineShapeStruct };
				shape.worldStart = lineStart;
				shape.worldEnd = lineEnd;
				shape.matrixWorld = mat4x4f(
					1.0, 0.0, 0.0, 0.0,
					0.0, 1.0, 0.0, 0.0,
					0.0, 0.0, 1.0, 0.0,
					0.0, 0.0, 0.0, 1.0
				);
				shape.objectIndex = 0u;
				shape.edgeIndex = edgeIndex;

				${ traversalFn }( shape );

			}
		`;

	}

}
