import {
	isYProjectedTriangleDegenerate,
	isLineTriangleEdge,
} from './triangleLineUtils.js';
import { trimToBeneathTriPlane } from './trimToBeneathTriPlane.js';
import { getProjectedLineOverlap } from './getProjectedLineOverlap.js';
import { appendOverlapRange } from './getProjectedOverlaps.js';
import { Line3 } from 'three';
import { ExtendedTriangle } from 'three-mesh-bvh';

const DIST_THRESHOLD = 1e-10;
const _beneathLine = /* @__PURE__ */ new Line3();
const _overlapLine = /* @__PURE__ */ new Line3();
const _tri = new ExtendedTriangle();

/**
 * Uses bvhcast to compare edges BVH against mesh BVHs to find hidden line overlaps.
 * This is more efficient than testing each edge individually because multiple edges
 * can share the same bounds traversal operations.
 *
 * @param {MeshBVH} edgesBvh - BVH built from edge geometry
 * @param {Array} edges - Array of Line3 edges
 * @param {Array} meshes - Array of meshes to test against
 * @param {Map} bvhs - Map of geometry to BVH
 * @param {Object} hiddenOverlapMap - Map of edge index to array of hidden overlap ranges
 */
export function bvhcastEdges( edgesBvh, edges, meshes, bvhs, hiddenOverlapMap ) {

	for ( let m = 0; m < meshes.length; m ++ ) {

		const mesh = meshes[ m ];
		const bvh = bvhs.get( mesh.geometry );
		const { matrixWorld } = mesh;

		const edgeGeometry = edgesBvh.geometry;
		const geometry = mesh.geometry;

		edgesBvh.bvhcast( bvh, matrixWorld, {

			intersectsRanges: ( edgeOffset, edgeCount, meshOffset, meshCount ) => {

				for ( let i = meshOffset, l = meshCount + meshOffset; i < l; i ++ ) {

					let i0 = 3 * i + 0;
					let i1 = 3 * i + 1;
					let i2 = 3 * i + 2;
					if ( geometry.index ) {

						i0 = geometry.index.getX( i0 );
						i1 = geometry.index.getX( i1 );
						i2 = geometry.index.getX( i2 );

					}

					// Transform mesh triangle to world space
					const { a, b, c } = _tri;
					a.fromBufferAttribute( geometry.attributes.position, i0 ).applyMatrix4( matrixWorld );
					b.fromBufferAttribute( geometry.attributes.position, i1 ).applyMatrix4( matrixWorld );
					c.fromBufferAttribute( geometry.attributes.position, i2 ).applyMatrix4( matrixWorld );
					_tri.needsUpdate = true;

					// Skip degenerate projected triangles
					if ( isYProjectedTriangleDegenerate( _tri ) ) {

						continue;

					}

					const highestTriangleY = Math.max( a.y, b.y, c.y );
					const lowestTriangleY = Math.min( a.y, b.y, c.y );
					for ( let e = edgeOffset, le = edgeCount + edgeOffset; e < le; e ++ ) {

						const edgeIndex = edgeGeometry.index.getX( e * 3 ) / 3;
						const _line = edges[ edgeIndex ];

						// Calculate edge and triangle bounds
						const lowestLineY = Math.min( _line.start.y, _line.end.y );
						const highestLineY = Math.max( _line.start.y, _line.end.y );

						// Skip if triangle is completely below the line
						if ( highestTriangleY <= lowestLineY ) {

							continue;

						}

						// Skip if this line lies on a triangle edge
						if ( isLineTriangleEdge( _tri, _line ) ) {

							continue;

						}

						// Retrieve the portion of line that is below the triangle plane
						if ( highestLineY < lowestTriangleY ) {

							_beneathLine.copy( _line );

						} else if ( ! trimToBeneathTriPlane( _tri, _line, _beneathLine ) ) {

							continue;

						}

						// Cull overly small edges
						if ( _beneathLine.distance() < DIST_THRESHOLD ) {

							continue;

						}

						// Calculate projected overlap and store in hiddenOverlapMap
						if ( getProjectedLineOverlap( _beneathLine, _tri, _overlapLine ) ) {

							appendOverlapRange( _line, _overlapLine, hiddenOverlapMap[ edgeIndex ] );

						}

					}

				}

			},

		} );

	}

}
