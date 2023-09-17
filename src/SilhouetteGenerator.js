import { Path64, Clipper, FillRule } from 'clipper2-js';
import { ShapeGeometry, Vector3, Shape, Vector2, Triangle } from 'three';

const UP_VECTOR = /* @__PURE__ */ new Vector3( 0, 1, 0 );
const _tri = /* @__PURE__ */ new Triangle();
const _normal = /* @__PURE__ */ new Vector3();
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

function isHole( path ) {

	// https://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
	let tot = 0;
	for ( let i = 0, l = path.length; i < l; i ++ ) {

		const ni = ( i + 1 ) % l;
		const v0 = path[ i ].clone();
		const v1 = path[ ni ].clone();

		tot += ( v1.x - v0.x ) * ( v1.y + v0.y );

	}

	return tot > 0;

}

export class SilhouetteGenerator {

	constructor() {

		this.iterationTime = 30;
		this.intScalar = 1e9;
		this.doubleSided = true;

	}

	generateAsync( geometry, options ) {

		return new Promise( ( resolve, reject ) => {

			const { signal } = options;
			const task = this.generate( geometry, options );
			run();

			function run() {

				if ( signal.aborted ) {

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

		const index = geometry.index;
		const posAttr = geometry.attributes.position;
		const vertCount = index ? index.count : posAttr.count;
		let nx = 0;
		let nz = 0;
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

			const { a, b, c } = _tri;
			a.fromBufferAttribute( posAttr, i0 );
			b.fromBufferAttribute( posAttr, i1 );
			c.fromBufferAttribute( posAttr, i2 );
			if ( ! doubleSided ) {

				_tri.getNormal( _normal );
				if ( _normal.dot( UP_VECTOR ) > 0 ) {

					continue;

				}

			}


			a.y = 0;
			b.y = 0;
			c.y = 0;

			nx = Math.min( nx, a.x, b.x, c.x );
			nz = Math.max( nz, a.z, b.z, c.z );

			const path = new Path64();
			path.push( Clipper.makePath( [
				a.x * intScalar, a.z * intScalar,
				b.x * intScalar, b.z * intScalar,
				c.x * intScalar, c.z * intScalar,
			] ) );

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

		const vector2s = overallPath
			.map( points =>
				points.flatMap( v => new Vector2( v.x / intScalar, v.y / intScalar ) )
			);

		const holesShapes = vector2s
			.filter( p => isHole( p ) )
			.map( p => new Shape( p ) );

		const solidShapes = vector2s
			.filter( p => ! isHole( p ) )
			.map( p => {

				const shape = new Shape( p );
				shape.holes = holesShapes;
				return shape;

			} );

		window.HOLES = holesShapes;
		window.SOLIDS = solidShapes;

		const result = new ShapeGeometry( solidShapes[ 0 ] ).rotateX( Math.PI / 2 );
		result.index.array.reverse();
		return result;

	}

}
