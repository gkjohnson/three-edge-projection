import { BufferAttribute, BufferGeometry, Line3, Plane, Vector3 } from 'three';
import { MeshBVH } from 'three-mesh-bvh';

const _line = new Line3();
const _target = new Line3();
const _vec = new Vector3();
const EPS = 1e-16;

/**
 * Utility for generating the line segments produced by a planar intersection with geometry.
 */
export class PlanarIntersectionGenerator {

	constructor() {

		/**
		 * Plane that defaults to y up plane at the origin.
		 * @type {Plane}
		 */
		this.plane = new Plane( new Vector3( 0, 1, 0 ), 0 );

	}

	/**
	 * Generates a geometry of the resulting line segments from the planar intersection.
	 * @param {MeshBVH|BufferGeometry} geometry
	 * @returns {BufferGeometry}
	 */
	generate( bvh ) {

		const { plane } = this;
		if ( bvh instanceof BufferGeometry ) {

			bvh = new MeshBVH( bvh, { targetLeafSize: 1 } );

		}

		const edgesArray = [];
		bvh.shapecast( {

			intersectsBounds: box => {

				return plane.intersectsBox( box );

			},

			intersectsTriangle: tri => {

				const { points } = tri;
				let foundPoints = 0;
				for ( let i = 0; i < 3; i ++ ) {

					const ni = ( i + 1 ) % 3;
					_line.start.copy( points[ i ] );
					_line.end.copy( points[ ni ] );

					if ( plane.intersectLine( _line, _vec ) ) {

						if ( foundPoints === 1 ) {

							if ( _vec.distanceTo( _target.start ) > EPS ) {

								_target.end.copy( _vec );
								foundPoints ++;
								break;

							}

						} else {

							_target.start.copy( _vec );
							foundPoints ++;

						}

					}

				}

				if ( foundPoints === 2 ) {

					edgesArray.push( ..._target.start, ..._target.end );

				}

			},

		} );

		// generate and return line geometry
		const edgeGeom = new BufferGeometry();
		const edgeBuffer = new BufferAttribute( new Float32Array( edgesArray ), 3, true );
		edgeGeom.setAttribute( 'position', edgeBuffer );
		return edgeGeom;

	}

}
