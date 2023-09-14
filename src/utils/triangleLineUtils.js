import { Vector3, Line3, Plane } from 'three';
import { getPlaneYAtPoint } from './planeUtils.js';
import { ExtendedTriangle } from 'three-mesh-bvh';

const _upVector = new Vector3( 0, 1, 0 );
const EPSILON = 1e-16;

// outputs the overlapping segment of a coplanar line and triangle
export const getOverlappingLine = ( function () {

	const _dir0 = new Vector3();
	const _dir1 = new Vector3();
	const _tempDir = new Vector3();
	const _orthoPlane = new Plane();
	const _line0 = new Line3();
	const _line1 = new Line3();
	const _tempLine = new Line3();

	return function getOverlappingLine( line, triangle, lineTarget = new Line3() ) {

		if ( triangle.needsUpdate ) {

			triangle.needsUpdate();

		}

		// if the triangle is degenerate then return no overlap
		if ( triangle.getArea() <= EPSILON ) {

			return null;

		}

		const { points, plane } = triangle;

		_line0.copy( line );
		_line0.delta( _dir0 );

		// if the line and triangle are not coplanar then return no overlap
		const areCoplanar = plane.normal.dot( _dir0 ) === 0.0;
		if ( ! areCoplanar ) {

			return null;

		}

		// a plane that's orthogonal to the triangle that the line lies on
		_dir0.cross( plane.normal ).normalize();
		_orthoPlane.setFromNormalAndCoplanarPoint( _dir0, _line0.start );

		// find the line of intersection of the triangle along the plane if it exists
		let intersectCount = 0;
		for ( let i = 0; i < 3; i ++ ) {

			const p1 = points[ i ];
			const p2 = points[ ( i + 1 ) % 3 ];

			_tempLine.start.copy( p1 );
			_tempLine.end.copy( p2 );
			if ( _orthoPlane.distanceToPoint( _tempLine.end ) === 0 && _orthoPlane.distanceToPoint( _tempLine.start ) === 0 ) {

				// if the edge lies on the plane then take the line
				_line1.copy( _tempLine );
				intersectCount = 2;
				break;

			} else if ( _orthoPlane.intersectLine( _tempLine, intersectCount === 0 ? _line1.start : _line1.end ) ) {

				let p;
				if ( intersectCount === 0 ) {

					p = _line1.start;

				} else {

					p = _line1.end;

				}

				if ( p.distanceTo( p2 ) === 0.0 ) {

					continue;

				}

				intersectCount ++;
				if ( intersectCount === 2 ) {

					break;

				}

			}

		}

		if ( intersectCount === 2 ) {

			// find the intersect line if any
			_line0.delta( _dir0 ).normalize();
			_line1.delta( _dir1 ).normalize();

			// swap edges so they're facing in the same direction
			if ( _dir0.dot( _dir1 ) < 0 ) {

				let tmp = _line1.start;
				_line1.start = _line1.end;
				_line1.end = tmp;

			}

			// check if the edges are overlapping
			const s1 = _line0.start.dot( _dir0 );
			const e1 = _line0.end.dot( _dir0 );
			const s2 = _line1.start.dot( _dir0 );
			const e2 = _line1.end.dot( _dir0 );
			const separated1 = e1 < s2;
			const separated2 = s1 < e2;

			if ( s1 !== e2 && s2 !== e1 && separated1 === separated2 ) {

				return null;

			}

			// assign the target output
			_tempDir.subVectors( _line0.start, _line1.start );
			if ( _tempDir.dot( _dir0 ) > 0 ) {

				lineTarget.start.copy( _line0.start );

			} else {

				lineTarget.start.copy( _line1.start );

			}

			_tempDir.subVectors( _line0.end, _line1.end );
			if ( _tempDir.dot( _dir0 ) < 0 ) {

				lineTarget.end.copy( _line0.end );

			} else {

				lineTarget.end.copy( _line1.end );

			}

			return lineTarget;

		}

		return null;

	};

} )();

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

// Extracts the normalized [0, 1] distances along the given line that overlaps with the provided triangle when
// projected along the y axis
export const getProjectedOverlaps = ( function () {

	const _target = new Line3();
	const _tempDir = new Vector3();
	const _tempVec0 = new Vector3();
	const _tempVec1 = new Vector3();
	const _line = new Line3();
	const _tri = new ExtendedTriangle();

	return function getProjectedOverlaps( tri, line, overlapsTarget ) {

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

			if ( ! ( Math.abs( d0 - d1 ) <= EPSILON ) ) {

				overlapsTarget.push( new Float32Array( [ d0, d1 ] ) );

			}

			return true;

		}

		return false;

	};

} )();

// Trim the provided line to just the section below the given triangle plane
export const trimToBeneathTriPlane = ( function () {

	const _lineDirection = new Vector3();
	const _planeHit = new Vector3();
	const _centerPoint = new Vector3();
	const _planePoint = new Vector3();

	return function trimToBeneathTriPlane( tri, line, lineTarget ) {

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

	};

} )();

