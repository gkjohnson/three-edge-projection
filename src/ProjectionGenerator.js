import {
	BufferGeometry,
	Vector3,
	Line3,
	Ray,
	BufferAttribute,
	Mesh,
} from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import {
	isYProjectedTriangleDegenerate,
	isLineTriangleEdge,
	isYProjectedLineDegenerate,
} from './utils/triangleLineUtils.js';
import { overlapsToLines } from './utils/overlapUtils.js';
import { trimToBeneathTriPlane } from './utils/trimToBeneathTriPlane.js';
import { getProjectedLineOverlap } from './utils/getProjectedLineOverlap.js';
import { appendOverlapRange } from './utils/getProjectedOverlaps.js';
import { EdgeGenerator } from './EdgeGenerator.js';

// these shared variables are not used across "yield" boundaries in the
// generator so there's no risk of overwriting another tasks data
const DIST_THRESHOLD = 1e-10;
const UP_VECTOR = /* @__PURE__ */ new Vector3( 0, 1, 0 );
const _beneathLine = /* @__PURE__ */ new Line3();
const _ray = /* @__PURE__ */ new Ray();
const _vec = /* @__PURE__ */ new Vector3();
const _overlapLine = /* @__PURE__ */ new Line3();

function toLineGeometry( edges ) {

	const edgeArray = new Float32Array( edges.length * 6 );
	let c = 0;
	for ( let i = 0, l = edges.length; i < l; i ++ ) {

		const line = edges[ i ];
		edgeArray[ c ++ ] = line[ 0 ];
		edgeArray[ c ++ ] = 0;
		edgeArray[ c ++ ] = line[ 2 ];
		edgeArray[ c ++ ] = line[ 3 ];
		edgeArray[ c ++ ] = 0;
		edgeArray[ c ++ ] = line[ 5 ];

	}

	const edgeGeom = new BufferGeometry();
	const edgeBuffer = new BufferAttribute( edgeArray, 3, true );
	edgeGeom.setAttribute( 'position', edgeBuffer );
	return edgeGeom;

}

class ProjectedEdgeCollector {

	constructor( scene ) {

		const meshes = [];
		scene.traverse( c => {

			if ( c.geometry ) {

				meshes.push( c );

			}

		} );

		this.meshes = meshes;
		this.bvhs = new Map();
		this.visibleEdges = [];
		this.hiddenEdges = [];
		this.iterationTime = 30;

	}

	reset() {

		this.visibleEdges.length = 0;
		this.hiddenEdges.length = 0;

	}

	getVisibleLineGeometry() {

		return toLineGeometry( this.visibleEdges );

	}

	getHiddenLineGeometry() {

		return toLineGeometry( this.hiddenEdges );


	}

	addEdges( edges ) {

		const currIterationTime = this.iterationTime;
		this.iterationTime = Infinity;

		const result = this.addEdgesGenerator( edges ).next().value;
		this.iterationTime = currIterationTime;

		return result;

	}

	// all edges are expected to be in world coordinates
	*addEdgesGenerator( edges, options = {} ) {

		const { onProgress = null } = options;
		const { meshes, bvhs, visibleEdges, hiddenEdges, iterationTime } = this;
		let time = performance.now();
		for ( let i = 0; i < meshes.length; i ++ ) {

			if ( performance.now() - time > iterationTime ) {

				yield;
				time = performance.now();

			}

			const mesh = meshes[ i ];
			const geometry = mesh.geometry;
			if ( ! bvhs.has( geometry ) ) {

				const bvh = geometry.boundsTree || new MeshBVH( geometry );
				bvhs.set( geometry, bvh );

			}

		}

		for ( let i = 0, l = edges.length; i < l; i ++ ) {

			const line = edges[ i ];
			if ( isYProjectedLineDegenerate( line ) ) {

				continue;

			}

			const lowestLineY = Math.min( line.start.y, line.end.y );
			const highestLineY = Math.max( line.start.y, line.end.y );
			const lineDistSq = line.distanceSq();
			const hiddenOverlaps = [];

			// Calculate ray once for this edge (used for bounds testing)
			const { origin, direction } = _ray;
			origin.copy( line.start );
			line.delta( direction ).normalize();

			for ( let m = 0; m < meshes.length; m ++ ) {

				if ( performance.now() - time > iterationTime ) {

					if ( onProgress ) {

						const progress = i / edges.length;
						onProgress( progress, this );

					}

					yield;
					time = performance.now();

				}

				const mesh = meshes[ m ];
				const bvh = bvhs.get( mesh.geometry );
				const { matrixWorld } = mesh;

				// TODO: see if we can adjust any of these functions to operate locally in a way that's faster
				// than being able to rely on the "projection" direction being "y". Currently everything is transformed
				// to world space to account for this
				bvh.shapecast( {

					intersectsBounds: box => {

						box.applyMatrix4( matrixWorld );

						// expand the bounding box to the bottom height of the line
						box.min.y = Math.min( lowestLineY - 1e-6, box.min.y );

						// if the ray is inside the box then we intersect it
						if ( box.containsPoint( origin ) ) {

							return true;

						}

						// check if the line segment intersects the box
						if ( _ray.intersectBox( box, _vec ) ) {

							return origin.distanceToSquared( _vec ) < lineDistSq;

						}

						return false;

					},

					intersectsTriangle: tri => {

						const { a, b, c } = tri;
						a.applyMatrix4( matrixWorld );
						b.applyMatrix4( matrixWorld );
						c.applyMatrix4( matrixWorld );

						// skip the triangle if the triangle is completely below the line
						const highestTriangleY = Math.max( a.y, b.y, c.y );
						if ( highestTriangleY <= lowestLineY ) {

							return false;

						}

						// if the projected triangle is just a line then don't check it
						if ( isYProjectedTriangleDegenerate( tri ) ) {

							return false;

						}

						// if this line lies on a triangle edge then don't check for visual overlaps
						// with this triangle
						if ( isLineTriangleEdge( tri, line ) ) {

							return false;

						}

						// Retrieve the portion of line that is below the plane - and skip the triangle if none
						// of it is
						const lowestTriangleY = Math.min( a.y, b.y, c.y );
						if ( highestLineY < lowestTriangleY ) {

							_beneathLine.copy( line );

						} else if ( ! trimToBeneathTriPlane( tri, line, _beneathLine ) ) {

							return false;

						}

						// Cull overly small edges
						if ( _beneathLine.distance() < DIST_THRESHOLD ) {

							return false;

						}

						// compress the edge overlaps so we can easily tell if the whole edge is hidden already
						// and exit early
						if ( getProjectedLineOverlap( _beneathLine, tri, _overlapLine ) ) {

							appendOverlapRange( line, _overlapLine, hiddenOverlaps );

						}

						// if we're hiding the edge entirely now then skip further checks
						if ( hiddenOverlaps.length !== 0 ) {

							const [ d0, d1 ] = hiddenOverlaps[ hiddenOverlaps.length - 1 ];
							return d0 === 0.0 && d1 === 1.0;

						}

						return false;

					},

				} );

			}

			// convert the overlap points to proper lines
			overlapsToLines( line, hiddenOverlaps, false, visibleEdges );
			overlapsToLines( line, hiddenOverlaps, true, hiddenEdges );

		}

	}

}

export class ProjectionGenerator {

	constructor() {

		this.sortEdges = true;
		this.iterationTime = 30;
		this.angleThreshold = 50;
		this.includeIntersectionEdges = true;

	}

	generateAsync( geometry, options = {} ) {

		return new Promise( ( resolve, reject ) => {

			const { signal } = options;
			const task = this.generate( geometry, options );
			run();

			function run() {

				if ( signal && signal.aborted ) {

					reject( new Error( 'ProjectionGenerator: Process aborted via AbortSignal.' ) );
					return;

				}

				const result = task.next();
				if ( result.done ) {

					resolve( result.value );

				} else {

					requestAnimationFrame( run );

				}

			}


		} );

	}

	*generate( scene, options = {} ) {

		const { onProgress } = options;
		const { sortEdges, iterationTime, angleThreshold, includeIntersectionEdges } = this;

		if ( scene.isBufferGeometry ) {

			scene = new Mesh( scene );

		}

		const edgeGenerator = new EdgeGenerator();
		edgeGenerator.iterationTime = iterationTime;
		edgeGenerator.thresholdAngle = angleThreshold;
		edgeGenerator.projectionDirection.copy( UP_VECTOR );

		let edges = yield* edgeGenerator.getEdgesGenerator( scene );
		if ( includeIntersectionEdges ) {

			yield* edgeGenerator.getIntersectionEdgesGenerator( scene, edges );

		}

		// sort the edges from lowest to highest
		if ( sortEdges ) {

			edges.sort( ( a, b ) => {

				let delta = Math.min( a.start.y, a.end.y ) - Math.min( b.start.y, b.end.y );
				if ( delta === 0 ) {

				 	delta = Math.min( a.start.x, a.end.x ) - Math.min( b.start.x, b.end.x );

				}

				if ( delta === 0 ) {

				 	delta = Math.min( a.start.z, a.end.z ) - Math.min( b.start.z, b.end.z );

				}

				return - delta;

			} );

		}

		yield;

		const collector = new ProjectedEdgeCollector( scene );
		collector.iterationTime = iterationTime;
		yield* collector.addEdgesGenerator( edges, { onProgress } );

		return collector;

	}

}
