import {
	BufferGeometry,
	Vector3,
	Line3,
	Ray,
	BufferAttribute,
} from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import {
	isYProjectedTriangleDegenerate,
	isLineTriangleEdge,
	isYProjectedLineDegenerate,
} from './utils/triangleLineUtils.js';
import { generateEdges } from './utils/generateEdges.js';
import { compressEdgeOverlaps, overlapsToLines } from './utils/overlapUtils.js';
import { isLineAbovePlane } from './utils/planeUtils.js';
import { trimToBeneathTriPlane } from './utils/trimBeneathTriPlane.js';
import { getProjectedOverlaps } from './utils/getProjectedOverlaps.js';

class EdgeSet {

	constructor() {

		this.edges = [];

	}

	getLineGeometry( y = 0 ) {

		const edges = this.edges;
		const edgeArray = new Float32Array( edges.length * 6 );
		let c = 0;
		for ( let i = 0, l = edges.length; i < l; i ++ ) {

			const line = edges[ i ];
			edgeArray[ c ++ ] = line[ 0 ];
			edgeArray[ c ++ ] = y;
			edgeArray[ c ++ ] = line[ 2 ];
			edgeArray[ c ++ ] = line[ 3 ];
			edgeArray[ c ++ ] = y;
			edgeArray[ c ++ ] = line[ 5 ];

		}

		const edgeGeom = new BufferGeometry();
		const edgeBuffer = new BufferAttribute( edgeArray, 3, true );
		edgeGeom.setAttribute( 'position', edgeBuffer );
		return edgeGeom;

	}

}

export class ProjectionGenerator {

	constructor() {

		this.sortEdges = true;
		this.iterationTime = 30;

	}

	generateAsync( ...args ) {

		return new Promise( resolve => {

			const task = this.generate( ...args );
			run();

			function run() {

				const result = task.next();
				if ( result.done ) {

					resolve( result.value );

				} else {

					requestAnimationFrame( run );

				}

			}


		} );

	}

	*generate( bvh, options = {} ) {

		const { onProgress } = options;
		const { sortEdges, iterationTime } = this;

		if ( bvh instanceof BufferGeometry ) {

			bvh = new MeshBVH( bvh );

		}

		const geometry = bvh.geometry;
		const edges = generateEdges( geometry, new Vector3( 0, 1, 0 ), 50 );
		if ( sortEdges ) {

			edges.sort( ( a, b ) => {

				return Math.min( a.start.y, a.end.y ) - Math.min( b.start.y, b.end.y );

			} );

		}

		yield;

		// trim the candidate edges
		const finalEdges = new EdgeSet();
		const tempLine = new Line3();
		const tempRay = new Ray();
		const tempVec = new Vector3();
		let time = performance.now();
		for ( let i = 0, l = edges.length; i < l; i ++ ) {

			const line = edges[ i ];
			if ( isYProjectedLineDegenerate( line ) ) {

				continue;

			}

			const lowestLineY = Math.min( line.start.y, line.end.y );
			const overlaps = [];
			bvh.shapecast( {

				intersectsBounds: box => {

					// check if the box bounds are above the lowest line point
					box.min.y = Math.min( lowestLineY, box.min.y );
					tempRay.origin.copy( line.start );
					line.delta( tempRay.direction ).normalize();

					if ( box.containsPoint( tempRay.origin ) ) {

						return true;

					}

					if ( tempRay.intersectBox( box, tempVec ) ) {

						return tempRay.origin.distanceToSquared( tempVec ) < line.distanceSq();

					}

					return false;

				},

				intersectsTriangle: tri => {

					// skip the triangle if it is completely below the line
					const highestTriangleY = Math.max( tri.a.y, tri.b.y, tri.c.y );

					if ( highestTriangleY < lowestLineY ) {

						return false;

					}

					// if the projected triangle is just a line then don't check it
					if ( isYProjectedTriangleDegenerate( tri ) ) {

						return false;

					}

					// if this line lies on a triangle edge then don't check it
					if ( isLineTriangleEdge( tri, line ) ) {

						return false;

					}

					trimToBeneathTriPlane( tri, line, tempLine );

					if ( isLineAbovePlane( tri.plane, tempLine ) ) {

						return false;

					}

					if ( tempLine.distance() < 1e-10 ) {

						return false;

					}

					// compress the edge overlaps so we can easily tell if the whole edge is hidden already
					// and exit early
					if ( getProjectedOverlaps( tri, line, overlaps ) ) {

						compressEdgeOverlaps( overlaps );

					}

					// if we're hiding the edge entirely now then skip further checks
					if ( overlaps.length !== 0 ) {

						const [ d0, d1 ] = overlaps[ overlaps.length - 1 ];
						return d0 === 0.0 && d1 === 1.0;

					}

					return false;

				},

			} );

			overlapsToLines( line, overlaps, finalEdges.edges );

			const delta = performance.now() - time;
			if ( delta > iterationTime ) {

				if ( onProgress ) {

					const progress = i / edges.length;
					onProgress( progress, finalEdges );

				}

				yield;
				time = performance.now();

			}

		}

		return finalEdges.getLineGeometry( 0 );

	}

}
