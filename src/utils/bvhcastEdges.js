import {
	isYProjectedTriangleDegenerate,
	isLineTriangleEdge,
	isYProjectedLineDegenerate,
} from './triangleLineUtils.js';
import { trimToBeneathTriPlane } from './trimToBeneathTriPlane.js';
import { getProjectedLineOverlap } from './getProjectedLineOverlap.js';
import { appendOverlapRange } from './getProjectedOverlaps.js';
import { Line3 } from 'three';

const DIST_THRESHOLD = 1e-10;
const _beneathLine = /* @__PURE__ */ new Line3();
const _overlapLine = /* @__PURE__ */ new Line3();

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

		edgesBvh.bvhcast( bvh, matrixWorld, {

			intersectsTriangles: ( edgeTri, meshTri, edgeTriIndex, meshTriIndex ) => {

				// Get the edge from the degenerate triangle index
				const edgeIndex = edgesBvh.geometry.index.getX( edgeTriIndex * 3 ) / 3;
				const line = edges[ edgeIndex ];

				// Skip degenerate projected lines
				if ( isYProjectedLineDegenerate( line ) ) {

					return false;

				}

				// Transform mesh triangle to world space
				const { a, b, c } = meshTri;
				a.applyMatrix4( matrixWorld );
				b.applyMatrix4( matrixWorld );
				c.applyMatrix4( matrixWorld );

				// Calculate edge and triangle bounds
				const lowestLineY = Math.min( line.start.y, line.end.y );
				const highestLineY = Math.max( line.start.y, line.end.y );
				const highestTriangleY = Math.max( a.y, b.y, c.y );
				const lowestTriangleY = Math.min( a.y, b.y, c.y );

				// Skip if triangle is completely below the line
				if ( highestTriangleY <= lowestLineY ) {

					return false;

				}

				// Skip degenerate projected triangles
				if ( isYProjectedTriangleDegenerate( meshTri ) ) {

					return false;

				}

				// Skip if this line lies on a triangle edge
				if ( isLineTriangleEdge( meshTri, line ) ) {

					return false;

				}

				// Retrieve the portion of line that is below the triangle plane
				if ( highestLineY < lowestTriangleY ) {

					_beneathLine.copy( line );

				} else if ( ! trimToBeneathTriPlane( meshTri, line, _beneathLine ) ) {

					return false;

				}

				// Cull overly small edges
				if ( _beneathLine.distance() < DIST_THRESHOLD ) {

					return false;

				}

				// Calculate projected overlap and store in hiddenOverlapMap
				if ( getProjectedLineOverlap( _beneathLine, meshTri, _overlapLine ) ) {

					appendOverlapRange( line, _overlapLine, hiddenOverlapMap[ edgeIndex ] );

				}

				return false;

			},

		} );

	}

}
