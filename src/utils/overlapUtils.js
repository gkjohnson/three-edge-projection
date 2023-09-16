import { Line3 } from 'three';

const _line = /* @__PURE__ */ new Line3();

// compresses the given edge overlaps into a minimal set of representative objects
export function compressEdgeOverlaps( overlaps ) {

	overlaps.sort( ( a, b ) => {

		return a[ 0 ] - b[ 0 ];

	} );

	for ( let i = 1; i < overlaps.length; i ++ ) {

		const overlap = overlaps[ i ];
		const prevOverlap = overlaps[ i - 1 ];
		if ( prevOverlap[ 1 ] >= overlap[ 0 ] ) {

			prevOverlap[ 1 ] = Math.max( prevOverlap[ 1 ], overlap[ 1 ] );
			overlaps.splice( i, 1 );
			i --;

		}

	}

}


// Converts the given array of overlaps into line segments
export function overlapsToLines( line, overlaps, target = [] ) {

	compressEdgeOverlaps( overlaps );

	const invOverlaps = [[ 0, 1 ]];
	for ( let i = 0, l = overlaps.length; i < l; i ++ ) {

		const invOverlap = invOverlaps[ i ];
		const overlap = overlaps[ i ];
		invOverlap[ 1 ] = overlap[ 0 ];
		invOverlaps.push( new Float32Array( [ overlap[ 1 ], 1 ] ) );

	}

	for ( let i = 0, l = invOverlaps.length; i < l; i ++ ) {

		const { start, end } = line;
		_line.start.lerpVectors( start, end, invOverlaps[ i ][ 0 ] );
		_line.end.lerpVectors( start, end, invOverlaps[ i ][ 1 ] );

		target.push( new Float32Array( [
			_line.start.x,
			_line.start.y,
			_line.start.z,

			_line.end.x,
			_line.end.y,
			_line.end.z,
		] ) );

	}

	return target;

}
