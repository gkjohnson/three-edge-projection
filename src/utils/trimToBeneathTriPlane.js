import { Plane, Vector3 } from 'three';
import { isYProjectedTriangleDegenerate } from './triangleLineUtils.js';

const EPSILON = 1e-16;
const _planeHit = /* @__PURE__ */ new Vector3();
const _lineDirection = /* @__PURE__ */ new Vector3();
export function trimToBeneathTriPlane( tri, line, lineTarget ) {

	// update triangle if needed
	if ( tri.needsUpdate ) {

		tri.update();

	}

	// if the plane is not facing up then flip the direction
	const plane = tri.plane;
	const startDist = plane.distanceToPoint( line.start );
	const endDist = plane.distanceToPoint( line.end );
	const isStartOnPlane = Math.abs( startDist ) < EPSILON;
	const isEndOnPlane = Math.abs( endDist ) < EPSILON;
	const isStartBelow = startDist < 0;
	const isEndBelow = endDist < 0;

	// if the line and plane are coplanar then return that we can't trim
	line.delta( _lineDirection ).normalize();
	if ( Math.abs( plane.normal.dot( _lineDirection ) ) < EPSILON ) {

		if ( isStartOnPlane || ! isStartBelow ) {

			return false;

		} else {

			lineTarget.copy( line );
			return true;

		}

	}

	// find the point that's below the plane. If both points are below the plane
	// then we assume we're dealing with floating point error
	if ( isStartBelow && isEndBelow ) {

		// if the whole line is below then just copy that
		lineTarget.copy( line );
		return true;

	} else if ( ! isStartBelow && ! isEndBelow ) {

		// if it's wholly above then skip it
		return false;

	} else {

		let didHit = plane.intersectLine( line, _planeHit );
		if ( ! didHit ) {

			if ( isStartOnPlane ) {

				_planeHit.copy( line.start );
				didHit = true;

			}

			if ( isEndOnPlane ) {

				_planeHit.copy( line.end );
				didHit = true;

			}

		}

		if ( didHit ) {

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

	}

	return false;

}
