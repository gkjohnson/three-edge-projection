import { Vector3 } from 'three';
import { getPlaneYAtPoint } from './planeUtils.js';
import { isYProjectedTriangleDegenerate } from './triangleLineUtils.js';

const EPSILON = 1e-16;
const _lineDirection = /* @__PURE__ */ new Vector3();
const _planeHit = /* @__PURE__ */ new Vector3();
const _planePoint = /* @__PURE__ */ new Vector3();
export function trimToBeneathTriPlane( tri, line, lineTarget ) {

	const { plane } = tri;
	lineTarget.copy( line );

	if ( tri.needsUpdate ) {

		tri.update();

	}

	// if the triangle is insignificant then skip it
	if ( isYProjectedTriangleDegenerate( tri ) ) {

		return false;

	}

	// if the line and plane are coplanar then return that we can't trim
	line.delta( _lineDirection );

	const areCoplanar = Math.abs( plane.normal.dot( _lineDirection ) ) < EPSILON;
	if ( areCoplanar ) {

		return false;

	}

	// if the line does intersect the plane then trim
	const doesLineIntersect = plane.intersectLine( line, _planeHit );
	if ( doesLineIntersect ) {

		const { start, end } = lineTarget;

		// test the line side with the largest segment extending beyond the plane
		let testPoint, otherPoint;
		if ( start.distanceToSquared( _planeHit ) > end.distanceToSquared( _planeHit ) ) {

			testPoint = start;
			otherPoint = end;

		} else {

			testPoint = end;
			otherPoint = start;

		}

		// get the center point of the line segment and the plane hit
		getPlaneYAtPoint( tri.plane, testPoint, _planePoint );

		// adjust the appropriate line point align with the plane hit point
		const isAbove = testPoint.y > _planePoint.y;
		if ( isAbove ) {

			testPoint.copy( _planeHit );

		} else {

			otherPoint.copy( _planeHit );

		}

		return true;

	}

	return false;

}
