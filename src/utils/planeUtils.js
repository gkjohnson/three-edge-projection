import { Vector3, Line3 } from "three";

const _line = /* @__PURE__ */ new Line3();
const _v0 = /* @__PURE__ */ new Vector3();
const _v1 = /* @__PURE__ */ new Vector3();

// returns the the y value on the plane at the given point x, z
export function getPlaneYAtPoint( plane, point, target = null ) {

	_line.start.copy( point );
	_line.end.copy( point );

	_line.start.y += 1e5;
	_line.end.y -= 1e5;

	plane.intersectLine( _line, target );

}

// returns whether the given line is above the given triangle plane
export function isLineAbovePlane( plane, line ) {

	_v0.lerpVectors( line.start, line.end, 0.5 );
	getPlaneYAtPoint( plane, _v0, _v1 );

	return _v1.y < _v0.y;

}
