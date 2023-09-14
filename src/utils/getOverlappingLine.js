import { Vector3, Line3, Plane } from 'three';

const AREA_EPSILON = 1e-16;
const _dir0 = new Vector3();
const _dir1 = new Vector3();
const _tempDir = new Vector3();
const _orthoPlane = new Plane();
const _line0 = new Line3();
const _line1 = new Line3();
const _tempLine = new Line3();

// outputs the overlapping segment of a coplanar line and triangle
export function getOverlappingLine( line, triangle, lineTarget = new Line3() ) {

	if ( triangle.needsUpdate ) {

		triangle.needsUpdate();

	}

	// if the triangle is degenerate then return no overlap
	if ( triangle.getArea() <= AREA_EPSILON ) {

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

}
