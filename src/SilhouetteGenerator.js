import { Path64, Clipper, FillRule } from 'clipper2-js';
import { ShapeGeometry, Vector3, Shape, Vector2, Triangle, ShapeUtils, Line3, BufferGeometry } from 'three';
import { compressPoints } from './utils/compressPoints.js';

const AREA_EPSILON = 1e-8;
const UP_VECTOR = /* @__PURE__ */ new Vector3( 0, 1, 0 );
const _tri = /* @__PURE__ */ new Triangle();
const _normal = /* @__PURE__ */ new Vector3();
const _center = /* @__PURE__ */ new Vector3();
const _vec = /* @__PURE__ */ new Vector3();

function triangleIsInside( tri, paths, scale ) {

	const indices = [ 'a', 'b', 'c' ];
	const edges = [ new Line3(), new Line3(), new Line3() ];
	const line = new Line3();
	const ray = new Line3();
	ray.start.set( 0, 0, 0 )
		.addScaledVector( tri.a, 1 / ( 3 * scale ) )
		.addScaledVector( tri.b, 1 / ( 3 * scale ) )
		.addScaledVector( tri.c, 1 / ( 3 * scale ) );
	ray.end.copy( ray.start );
	ray.end.y += 1e12;

	for ( let i = 0; i < 3; i ++ ) {

		const i1 = ( i + 1 ) % 3;
		const p0 = tri[ indices[ i ] ];
		const p1 = tri[ indices[ i1 ] ];

		edges[ i ].start.copy( p0 ).multiplyScalar( 1 / scale );
		edges[ i ].end.copy( p1 ).multiplyScalar( 1 / scale );

	}

	let crossCount = 0;
	for ( let p = 0, pl = paths.length; p < pl; p ++ ) {

		const points = paths[ p ];
		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const i1 = ( i + 1 ) % l;
			line.start.copy( points[ i ] ).multiplyScalar( 1 / scale );
			line.end.copy( points[ i1 ] ).multiplyScalar( 1 / scale );

			if ( lineCrossesLine( ray, line ) ) {

				crossCount ++;

			}

			for ( let e = 0; e < 3; e ++ ) {

				if ( lineCrossesLine( edges[ e ], line ) ) {

					return false;

				}

			}

		}

	}

	return crossCount % 2 === 1;

	// TODO: this function is not working as expected. What are the conditions?
	// https://stackoverflow.com/questions/3838329/how-can-i-check-if-two-segments-intersect
	function lineCrossesLine( l1, l2 ) {

		function ccw( A, B, C ) {

			return ( C.y - A.y ) * ( B.x - A.x ) > ( B.y - A.y ) * ( C.x - A.x );

		}

		const A = l1.start;
		const B = l1.end;

		const C = l2.start;
		const D = l2.end;

		return ccw( A, C, D ) !== ccw( B, C, D ) && ccw( A, B, C ) !== ccw( A, B, D );

	}

}

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

function convertPathToLineSegments( path, scale ) {

	const arr = [];
	path.forEach( points => {

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const i1 = ( i + 1 ) % points.length;
			const p0 = points[ i ];
			const p1 = points[ i1 ];
			arr.push(
				new Vector3( p0.x / scale, 0, p0.y / scale ),
				new Vector3( p1.x / scale, 0, p1.y / scale )
			);

		}

	} );

	const result = new BufferGeometry();
	result.setFromPoints( arr );
	return result;

}

export class SilhouetteGenerator {

	constructor() {

		this.iterationTime = 30;
		this.intScalar = 1e9;
		this.doubleSided = false;
		this.outputLineSegments = false;

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

		const { iterationTime, intScalar, doubleSided, outputLineSegments } = this;
		const { onProgress } = options;
		const power = Math.log10( intScalar );
		const extendMultiplier = Math.pow( 10, - ( power - 2 ) );

		const index = geometry.index;
		const posAttr = geometry.attributes.position;
		const vertCount = index ? index.count : posAttr.count;
		let overallPath = null;


		const handle = {

			getGeometry() {

				return outputLineSegments ?
					convertPathToLineSegments( overallPath, intScalar ) :
					convertPathToGeometry( overallPath, intScalar );

			}

		};

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
				overallPath.forEach( path => compressPoints( path ) );

			}

			const delta = performance.now() - time;
			if ( delta > iterationTime ) {

				if ( onProgress ) {

					const progress = i / vertCount;
					onProgress( progress, handle );

				}

				yield;
				time = performance.now();

			}

		}

		return outputLineSegments ?
			convertPathToLineSegments( overallPath, intScalar ) :
			convertPathToGeometry( overallPath, intScalar );

	}

}
