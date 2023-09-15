import { Vector3 } from 'three';

const EPSILON = 1e-16;
const _upVector = /* @__PURE__ */ new Vector3( 0, 1, 0 );

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
// TODO: this potentially seems problematic?
export function isLineTriangleEdge( tri, line ) {

	// if this is the same line as on the triangle
	const triPoints = tri.points;
	let startMatches = false;
	let endMatches = false;
	for ( let i = 0; i < 3; i ++ ) {

		const { start, end } = line;
		const tp = triPoints[ i ];
		if ( ! startMatches && start.distanceToSquared( tp ) <= EPSILON ) {

			startMatches = true;

		}

		if ( ! endMatches && end.distanceToSquared( tp ) <= EPSILON ) {

			endMatches = true;

		}

		if ( startMatches && endMatches ) {

			return true;

		}

	}

	return startMatches && endMatches;

}
