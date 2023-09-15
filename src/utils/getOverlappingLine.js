import { Vector3, Line3, Plane, LineLoop } from 'three';

const AREA_EPSILON = 1e-16;
const COPLANAR_EPSILON = 1e-16;
const DIST_EPSILON = 1e-16;
const _dir0 = /* @__PURE__ */ new Vector3();
const _dir1 = /* @__PURE__ */ new Vector3();
const _tempDir = /* @__PURE__ */ new Vector3();
const _orthoPlane = /* @__PURE__ */ new Plane();
const _line0 = /* @__PURE__ */ new Line3();
const _line1 = /* @__PURE__ */ new Line3();
const _tempLine = /* @__PURE__ */ new Line3();
const _point = /* @__PURE__ */ new Vector3();
const _vec = /* @__PURE__ */ new Vector3();

// outputs the overlapping segment of a coplanar line and triangle
export function getOverlappingLine( line, triangle, lineTarget = new Line3() ) {

	if ( triangle.needsUpdate ) {

		triangle.update();

	}

	// if the triangle is degenerate then return no overlap
	if ( triangle.getArea() <= AREA_EPSILON ) {

		return null;

	}

	const { points, plane } = triangle;

	_line0.copy( line );
	_line0.delta( _dir0 ).normalize();

	// if the line and triangle are not coplanar then return no overlap
	const areCoplanar = Math.abs( plane.normal.dot( _dir0 ) ) < COPLANAR_EPSILON;
	if ( ! areCoplanar ) {

		return null;

	}

	// a plane that's orthogonal to the triangle that the line lies on the line
	_dir0.cross( plane.normal ).normalize();
	_orthoPlane.setFromNormalAndCoplanarPoint( _dir0, _line0.start );

	// find the line of intersection of the triangle along the plane if it exists
	let intersectCount = 0;
	for ( let i = 0; i < 3; i ++ ) {

		const p1 = points[ i ];
		const p2 = points[ ( i + 1 ) % 3 ];

		_tempLine.start.copy( p1 );
		_tempLine.end.copy( p2 );
		const startIntersects = Math.abs( _orthoPlane.distanceToPoint( _tempLine.start ) ) < DIST_EPSILON;
		const endIntersects = Math.abs( _orthoPlane.distanceToPoint( _tempLine.end ) ) < DIST_EPSILON;
		const edgeIntersects = _orthoPlane.intersectLine( _tempLine, _point );

		if ( edgeIntersects && ! endIntersects || startIntersects ) {

			if ( startIntersects && ! edgeIntersects ) {

				_point.copy( _tempLine.start );

			}

			if ( intersectCount === 0 ) {

				_line1.start.copy( _point );

			} else {

				_line1.end.copy( _point );

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
		const s1 = 0;
		const e1 = _vec.subVectors( _line0.end, _line0.start ).dot( _dir0 );
		const s2 = _vec.subVectors( _line1.start, _line0.start ).dot( _dir0 );
		const e2 = _vec.subVectors( _line1.end, _line0.start ).dot( _dir0 );
		const separated1 = e1 <= s2;
		const separated2 = e2 <= s1;

		if ( separated1 || separated2 ) {

			return null;

		}

		lineTarget.start
			.copy( _line0.start )
			.addScaledVector( _dir0, Math.max( s1, s2 ) );
		lineTarget.end
			.copy( _line0.start )
			.addScaledVector( _dir0, Math.min( e1, e2 ) );

		return lineTarget;

	}

	return null;

}
