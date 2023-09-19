import { Line3 } from 'three';

export function triangleIsInsidePaths( tri, paths ) {

	const indices = [ 'a', 'b', 'c' ];
	const edges = [ new Line3(), new Line3(), new Line3() ];
	const line = new Line3();
	const ray = new Line3();
	ray.start.set( 0, 0, 0 )
		.addScaledVector( tri.a, 1 / 3 )
		.addScaledVector( tri.b, 1 / 3 )
		.addScaledVector( tri.c, 1 / 3 );
	ray.end.copy( ray.start );
	ray.end.y += 1e12;

	for ( let i = 0; i < 3; i ++ ) {

		const i1 = ( i + 1 ) % 3;
		const p0 = tri[ indices[ i ] ];
		const p1 = tri[ indices[ i1 ] ];

		edges[ i ].start.copy( p0 );
		edges[ i ].end.copy( p1 );

	}

	let crossCount = 0;
	for ( let p = 0, pl = paths.length; p < pl; p ++ ) {

		const points = paths[ p ];
		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const i1 = ( i + 1 ) % l;
			line.start.copy( points[ i ] );
			line.end.copy( points[ i1 ] );

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
