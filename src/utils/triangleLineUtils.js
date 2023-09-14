import { Vector3 } from 'three';

const EPSILON = 1e-16;
const _upVector = new Vector3( 0, 1, 0 );

export const isYProjectedLineDegenerate = ( function () {

	const _tempDir = new Vector3();
	const _upVector = new Vector3( 0, 1, 0 );
	return function isYProjectedLineDegenerate( line ) {

		line.delta( _tempDir ).normalize();
		return Math.abs( _tempDir.dot( _upVector ) ) >= 1.0 - EPSILON;

	};

} )();

// checks whether the y-projected triangle will be degenerate
export function isYProjectedTriangleDegenerate( tri ) {

	if ( tri.needsUpdate ) {

		tri.update();

	}

	return Math.abs( tri.plane.normal.dot( _upVector ) ) <= EPSILON;

}

// Is the provided line exactly an edge on the triangle
export function isLineTriangleEdge( tri, line ) {

	// if this is the same line as on the triangle
	const triPoints = tri.points;
	let matches = 0;
	for ( let i = 0; i < 3; i ++ ) {

		const { start, end } = line;
		const tp = triPoints[ i ];
		if ( start.distanceToSquared( tp ) <= EPSILON ) {

			matches ++;

		}

		if ( end.distanceToSquared( tp ) <= EPSILON ) {

			matches ++;

		}

	}

	return matches >= 2;

}
