import { Path64, Clipper, FillRule } from 'clipper2-js';
import { ShapeGeometry, Vector3, Shape, Vector2, Triangle, ShapeUtils } from 'three';

const AREA_EPSILON = 1e-8;
const UP_VECTOR = /* @__PURE__ */ new Vector3( 0, 1, 0 );
const _tri = /* @__PURE__ */ new Triangle();
const _normal = /* @__PURE__ */ new Vector3();
const _center = /* @__PURE__ */ new Vector3();
const _vec = /* @__PURE__ */ new Vector3();

function convertPathToGeometry( path, scale ) {

	const vector2s = path
		.map( points =>
			points.flatMap( v => new Vector2( v.x / scale, v.y / scale ) )
		);

	const holesShapes = vector2s
		.filter( p => ShapeUtils.isClockWise( p ) )
		.map( p => new Shape( p ) );

	const solidShapes = vector2s
		.filter( p => ! ShapeUtils.isClockWise( p ) )
		.map( p => {

			const shape = new Shape( p );
			shape.holes = holesShapes;
			return shape;

		} );

	const result = new ShapeGeometry( solidShapes ).rotateX( Math.PI / 2 );
	result.index.array.reverse();
	return result;

}

function compressPoints( path ) {

	for ( let i = 0, l = path.length; i < l; i ++ ) {

		const arr = path[ i ];
		for ( let k = 0; k < arr.length; k ++ ) {

			const v = arr[ k ];
			while ( arr.length > k + 1 && v.x === arr[ k + 1 ].x && v.y === arr[ k + 1 ].y ) {

				arr.splice( k + 1, 1 );

			}

		}

	}

}

export class SilhouetteGenerator {

	constructor() {

		this.iterationTime = 30;
		this.intScalar = 1e9;
		this.doubleSided = false;

	}

	generateAsync( geometry, options = {} ) {

		return new Promise( ( resolve, reject ) => {

			const { signal } = options;
			const task = this.generate( geometry, options );
			run();

			function run() {

				if ( signal && signal.aborted ) {

					reject( new Error( 'SilhouetteGenerator: Process aborted via AbortSignal.' ) );

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

	*generate( geometry, options = {} ) {

		const { iterationTime, intScalar, doubleSided } = this;
		const { onProgress } = options;
		const power = Math.log10( intScalar );
		const extendMultiplier = Math.pow( 10, - ( power - 2 ) );

		const index = geometry.index;
		const posAttr = geometry.attributes.position;
		const vertCount = index ? index.count : posAttr.count;
		let overallPath = null;

		let time = performance.now();
		for ( let i = 0; i < vertCount; i += 3 ) {

			let i0 = i + 0;
			let i1 = i + 1;
			let i2 = i + 2;
			if ( index ) {

				i0 = index.getX( i0 );
				i1 = index.getX( i1 );
				i2 = index.getX( i2 );

			}

			// get the triangle
			const { a, b, c } = _tri;
			a.fromBufferAttribute( posAttr, i0 );
			b.fromBufferAttribute( posAttr, i1 );
			c.fromBufferAttribute( posAttr, i2 );
			if ( ! doubleSided ) {

				_tri.getNormal( _normal );
				if ( _normal.dot( UP_VECTOR ) < 0 ) {

					continue;

				}

			}

			// flatten the triangle
			a.y = 0;
			b.y = 0;
			c.y = 0;

			if ( _tri.getArea() < AREA_EPSILON ) {

				continue;

			}

			// expand the triangle by a small degree to ensure overlap
			_center
				.copy( a )
				.add( b )
				.add( c )
				.multiplyScalar( 1 / 3 );

			_vec.subVectors( a, _center ).normalize();
			a.addScaledVector( _vec, extendMultiplier );

			_vec.subVectors( b, _center ).normalize();
			b.addScaledVector( _vec, extendMultiplier );

			_vec.subVectors( c, _center ).normalize();
			c.addScaledVector( _vec, extendMultiplier );

			// create the path
			const path = new Path64();
			path.push( Clipper.makePath( [
				a.x * intScalar, a.z * intScalar,
				b.x * intScalar, b.z * intScalar,
				c.x * intScalar, c.z * intScalar,
			] ) );

			// perform union
			if ( overallPath === null ) {

				overallPath = path;

			} else {

				overallPath = Clipper.Union( overallPath, path, FillRule.NonZero );
				compressPoints( overallPath );

			}

			const delta = performance.now() - time;
			if ( delta > iterationTime ) {

				if ( onProgress ) {

					const progress = i / vertCount;
					onProgress( progress );

				}

				yield;
				time = performance.now();

			}

		}

		return convertPathToGeometry( overallPath, intScalar );

	}

}
