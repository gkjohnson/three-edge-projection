import { Path64, Clipper, FillRule } from 'clipper2-js';
import { ShapeGeometry, Vector3, Shape, Vector2 } from 'three';

const _v0 = /* @__PURE__ */ new Vector3();
const _v1 = /* @__PURE__ */ new Vector3();
const _v2 = /* @__PURE__ */ new Vector3();
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

	const dir = new Vector2();
	let tot = 0;
	for ( let i = 0, l = path.length; i < l; i ++ ) {

		const ni = ( i + 1 ) % l;
		const v0 = path[ i ];
		const v1 = path[ ni ];

		const angle = v1.angleTo( v0 );
		const wind = dir.subVectors( v0, v1 ).cross( v0 );
		tot += angle * Math.sign( wind );

	}

	return tot < Math.PI;

}


export class SilhouetteGenerator {

	constructor() {

		this.iterationTime = 30;
		this.intScalar = 1e6;

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

		const { iterationTime, intScalar } = this;
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

			_v0.fromBufferAttribute( posAttr, i0 );
			_v1.fromBufferAttribute( posAttr, i1 );
			_v2.fromBufferAttribute( posAttr, i2 );

			_v0.y = 0;
			_v1.y = 0;
			_v2.y = 0;

			nx = Math.min( nx, _v0.x, _v1.x, _v2.x );
			nz = Math.max( nz, _v0.z, _v1.z, _v2.z );

			const path = new Path64();
			path.push( Clipper.makePath( [
				_v0.x * intScalar, _v0.z * intScalar,
				_v1.x * intScalar, _v1.z * intScalar,
				_v2.x * intScalar, _v2.z * intScalar,
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

		const points = overallPath.map( arr => {

			return arr.flatMap( v => new Vector2( v.x / intScalar, v.y / intScalar ) );

		} );

		const holesShapes = points.filter( p => isHole( p ) ).map( p => new Shape( p ) );
		const solidShapes = points.filter( p => ! isHole( p ) ).map( p => {

			const shape = new Shape( p );
			shape.holes = holesShapes;
			return shape;

		} );

		return solidShapes.map( s => new ShapeGeometry( s ).rotateX( - Math.PI / 2 ) );

	}

}
