import { Vector3, Line3 } from 'three';
import { ExtendedTriangle } from 'three-mesh-bvh';
import { getOverlappingLine } from './getOverlappingLine.js';

// Extracts the normalized [0, 1] distances along the given line that overlaps with the provided triangle when
// projected along the y axis
const DIST_EPSILON = 1e-16;
const _target = new Line3();
const _tempDir = new Vector3();
const _tempVec0 = new Vector3();
const _tempVec1 = new Vector3();
const _line = new Line3();
const _tri = new ExtendedTriangle();

export function getProjectedOverlaps( tri, line, overlapsTarget ) {

	_line.copy( line );
	_tri.copy( tri );

	// flatten them to a common plane
	_line.start.y = 0;
	_line.end.y = 0;
	_tri.a.y = 0;
	_tri.b.y = 0;
	_tri.c.y = 0;
	_tri.needsUpdate = true;
	_tri.update();

	// if the line is meaningfully long and the we have an overlapping line then extract the
	// distances along the original line to return
	if ( getOverlappingLine( _line, _tri, _target ) ) {

		_line.delta( _tempDir );
		_tempVec0.subVectors( _target.start, _line.start );
		_tempVec1.subVectors( _target.end, _line.start );

		let d0 = _tempVec0.length() / _tempDir.length();
		let d1 = _tempVec1.length() / _tempDir.length();

		d0 = Math.min( Math.max( d0, 0 ), 1 );
		d1 = Math.min( Math.max( d1, 0 ), 1 );

		if ( ! ( Math.abs( d0 - d1 ) <= DIST_EPSILON ) ) {

			overlapsTarget.push( new Float32Array( [ d0, d1 ] ) );

		}

		return true;

	}

	return false;

}
