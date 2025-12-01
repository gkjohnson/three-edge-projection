import { Vector3 } from 'three';
const DIST_EPSILON = 1e-16;
const _dir = /* @__PURE__ */ new Vector3();
const _v0 = /* @__PURE__ */ new Vector3();
const _v1 = /* @__PURE__ */ new Vector3();
export function appendOverlapRange( line, overlapLine, overlapsTarget ) {

	const result = getOverlapRange( line, overlapLine );
	if ( result ) {

		let [ start, end ] = result;
		let insertPoint = 0;
		let deleteCount = 0;
		for ( let i = 0, l = overlapsTarget.length; i < l; i ++ ) {

			const [ otherStart, otherEnd ] = overlapsTarget[ i ];
			if ( start <= otherEnd && end >= otherStart ) {

				// check if there's overlap
				start = Math.min( otherStart, start );
				end = Math.max( otherEnd, end );
				deleteCount ++;

			} else if ( start >= otherStart ) {

				// otherwise move the insertion point forward
				insertPoint = i + 1;

			} else {

				break;

			}

		}

		overlapsTarget.splice( insertPoint, deleteCount, [ start, end ] );

		return true;

	}

	return false;

}

// Returns the overlap range without pushing to array (for binary insertion)
export function getOverlapRange( line, overlapLine ) {

	line.delta( _dir );
	_v0.subVectors( overlapLine.start, line.start );
	_v1.subVectors( overlapLine.end, line.start );

	const length = _dir.length();
	let d0 = _v0.length() / length;
	let d1 = _v1.length() / length;

	d0 = Math.min( Math.max( d0, 0 ), 1 );
	d1 = Math.min( Math.max( d1, 0 ), 1 );

	if ( Math.abs( d0 - d1 ) <= DIST_EPSILON ) {

		return null;

	}

	return [ d0, d1 ];

}
