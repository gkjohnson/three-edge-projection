import { Plane, Vector3 } from 'three';
import { isYProjectedTriangleDegenerate } from './triangleLineUtils.js';

const EPSILON = 1e-16;
const UP_VECTOR = /* @__PURE__ */ new Vector3( 0, 1, 0 );
const _plane = /* @__PURE__ */ new Plane();
const _planeHit = /* @__PURE__ */ new Vector3();
const _lineDirection = /* @__PURE__ */ new Vector3();
export function trimToBeneathTriPlane( tri, line, lineTarget ) {

	// if the triangle is insignificant then skip it
	if ( isYProjectedTriangleDegenerate( tri ) ) {

		return false;

	}

	// update triangle if needed
	if ( tri.needsUpdate ) {

		tri.update();

	}

	// if the plane is not facing up then flip the direction
	_plane.copy( tri.plane );
	if ( _plane.normal.dot( UP_VECTOR ) < 0 ) {

		_plane.normal.multiplyScalar( - 1 );
		_plane.constant *= - 1;

	}

	// if the line and plane are coplanar then return that we can't trim
	line.delta( _lineDirection ).normalize();
	if ( Math.abs( _plane.normal.dot( _lineDirection ) ) < EPSILON ) {

		return false;

	}

	// find the point that's below the plane. If both points are below the plane
	// then we assume we're dealing with floating point error
	const isStartBelow = _plane.distanceToPoint( line.start ) < 0;
	const isEndBelow = _plane.distanceToPoint( line.end ) < 0;
	if ( isStartBelow && isEndBelow ) {

		// if the whole line is below then just copy that
		lineTarget.copy( line );
		return true;

	} else if ( ! isStartBelow && ! isEndBelow ) {

		// if it's wholly above then skip it
		return false;

	} else if ( _plane.intersectLine( line, _planeHit ) ) {

		if ( isStartBelow ) {

			lineTarget.start.copy( line.start );
			lineTarget.end.copy( _planeHit );
			return true;

		} else if ( isEndBelow ) {

			lineTarget.end.copy( line.end );
			lineTarget.start.copy( _planeHit );
			return true;

		}

	}

	return false;

}
