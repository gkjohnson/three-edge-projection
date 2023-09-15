import { Vector3, Line3 } from 'three';
import { ExtendedTriangle } from 'three-mesh-bvh';
import { getOverlappingLine } from './getOverlappingLine.js';

// Extracts the normalized [0, 1] distances along the given line that overlaps with the provided triangle when
// projected along the y axis
const DIST_EPSILON = 1e-16;
const _target = /* @__PURE__ */ new Line3();
const _dir = /* @__PURE__ */ new Vector3();
const _v0 = /* @__PURE__ */ new Vector3();
const _v1 = /* @__PURE__ */ new Vector3();
const _line = /* @__PURE__ */ new Line3();
const _tri = /* @__PURE__ */ new ExtendedTriangle();

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

		// const dir0 = _line.delta( new Vector3 ).normalize()
		// const dir1 = _target.delta( new Vector3 ).normalize()

		// if ( dir0.dot( dir1 ) < 0 ) console.log( dir0.dot( dir1 ) );

		// TODO: there are small vectors facing in opposite directions cropping up here
		_line.delta( _dir );
		_v0.subVectors( _target.start, _line.start );
		_v1.subVectors( _target.end, _line.start );

		const length = _dir.length();
		let d0 = _v0.length() / length;
		let d1 = _v1.length() / length;

		// console.log( d0, d1 );

		d0 = Math.min( Math.max( d0, 0 ), 1 );
		d1 = Math.min( Math.max( d1, 0 ), 1 );

		if ( ! ( Math.abs( d0 - d1 ) <= DIST_EPSILON ) ) {

			overlapsTarget.push( new Float32Array( [ d0, d1 ] ) );

		}

		return true;

	}

	return false;

}
