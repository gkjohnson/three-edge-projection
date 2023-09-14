import { Vector3 } from 'three';
import { getPlaneYAtPoint } from './planeUtils.js';
import { isYProjectedTriangleDegenerate } from './triangleLineUtils.js';

const _lineDirection = new Vector3();
const _planeHit = new Vector3();
const _centerPoint = new Vector3();
const _planePoint = new Vector3();

export function trimToBeneathTriPlane( tri, line, lineTarget ) {

	if ( tri.needsUpdate ) {

		tri.update();

	}

	lineTarget.copy( line );

	// handle vertical triangles
	const { plane } = tri;
	if ( isYProjectedTriangleDegenerate( tri ) ) {

		return false;

	}

	// if the line and plane are coplanar then return that we can't trim
	line.delta( _lineDirection );

	const areCoplanar = plane.normal.dot( _lineDirection ) === 0.0;
	if ( areCoplanar ) {

		return false;

	}

	// if the line does intersect the plane then trim
	const doesLineIntersect = plane.intersectLine( line, _planeHit );
	if ( doesLineIntersect ) {

		const { start, end } = lineTarget;

		// test the line side with the largest segment extending beyond the plane
		let testPoint;
		let flipped = false;
		if ( start.distanceTo( _planeHit ) > end.distanceTo( _planeHit ) ) {

			testPoint = start;

		} else {

			testPoint = end;
			flipped = true;

		}

		// get the center point of the line segment and the plane hit
		_centerPoint.lerpVectors( testPoint, _planeHit, 0.5 );
		getPlaneYAtPoint( tri.plane, _centerPoint, _planePoint );

		// adjust the appropriate line point align with the plane hit point
		if ( _planePoint.y < _centerPoint.y ) {

			if ( flipped ) end.copy( _planeHit );
			else start.copy( _planeHit );

		} else {

			if ( flipped ) start.copy( _planeHit );
			else end.copy( _planeHit );

		}

		return true;

	}

	return false;

}
