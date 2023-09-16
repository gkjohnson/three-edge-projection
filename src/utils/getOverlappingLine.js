import { Vector3, Line3, Plane } from 'three';
import { ExtendedTriangle } from 'three-mesh-bvh';

const AREA_EPSILON = 1e-16;
const DIST_EPSILON = 1e-16;
const _orthoPlane = /* @__PURE__ */ new Plane();
const _edgeLine = /* @__PURE__ */ new Line3();
const _point = /* @__PURE__ */ new Vector3();
const _vec = /* @__PURE__ */ new Vector3();
const _tri = /* @__PURE__ */ new ExtendedTriangle();
const _line = /* @__PURE__ */ new Line3();
const _triLine = /* @__PURE__ */ new Line3();
const _dir = /* @__PURE__ */ new Vector3();
const _triDir = /* @__PURE__ */ new Vector3();

// Returns the portion of the line that is overlapping the triangle when projected
// TODO: rename this, remove need for tri update, plane
export function getOverlappingLine( line, triangle, lineTarget = new Line3() ) {

	// if the line and triangle are not coplanar then return no overlap
	if ( triangle.needsUpdate ) {

		triangle.update();

	}

	// flatten the shapes
	_tri.copy( triangle );
	_tri.a.y = 0;
	_tri.b.y = 0;
	_tri.c.y = 0;
	_tri.update();

	_line.copy( line );
	_line.start.y = 0;
	_line.end.y = 0;

	// if the triangle is degenerate then return no overlap
	if ( _tri.getArea() <= AREA_EPSILON ) {

		return null;

	}

	_line.delta( _dir ).normalize();
	_dir.cross( _tri.plane.normal ).normalize();
	_orthoPlane.setFromNormalAndCoplanarPoint( _dir, _line.start );

	// find the line of intersection of the triangle along the plane if it exists
	let intersectCount = 0;
	const { points } = _tri;
	for ( let i = 0; i < 3; i ++ ) {

		const p1 = points[ i ];
		const p2 = points[ ( i + 1 ) % 3 ];

		_edgeLine.start.copy( p1 );
		_edgeLine.end.copy( p2 );
		const startIntersects = Math.abs( _orthoPlane.distanceToPoint( _edgeLine.start ) ) < DIST_EPSILON;
		const endIntersects = Math.abs( _orthoPlane.distanceToPoint( _edgeLine.end ) ) < DIST_EPSILON;
		const edgeIntersects = _orthoPlane.intersectLine( _edgeLine, _point );
		if ( edgeIntersects && ! endIntersects || startIntersects ) {

			if ( startIntersects && ! edgeIntersects ) {

				_point.copy( _edgeLine.start );

			}

			if ( intersectCount === 0 ) {

				_triLine.start.copy( _point );

			} else {

				_triLine.end.copy( _point );

			}

			intersectCount ++;
			if ( intersectCount === 2 ) {

				break;

			}

		}

	}

	if ( intersectCount === 2 ) {

		// find the intersect line if any
		_line.delta( _dir ).normalize();
		_triLine.delta( _triDir ).normalize();

		// swap edges so they're facing in the same direction
		if ( _dir.dot( _triDir ) < 0 ) {

			let tmp = _triLine.start;
			_triLine.start = _triLine.end;
			_triLine.end = tmp;

		}

		// check if the edges are overlapping
		const s1 = 0;
		const e1 = _vec.subVectors( _line.end, _line.start ).dot( _dir );
		const s2 = _vec.subVectors( _triLine.start, _line.start ).dot( _dir );
		const e2 = _vec.subVectors( _triLine.end, _line.start ).dot( _dir );
		const separated1 = e1 <= s2;
		const separated2 = e2 <= s1;

		console.log(  );

		if ( separated1 || separated2 ) {

			return null;

		}

		line.at(
			Math.max( s1, s2 ) / _line.distance(),
			lineTarget.start,
		);
		line.at(
			Math.min( e1, e2 ) / _line.distance(),
			lineTarget.end,
		);

		return lineTarget;

	}

}

// // outputs the overlapping segment of a coplanar line and triangle
// // TODO: this expected to work for 3d lines, as well, but the logic does not align.
// // This should be redesigned to work in 2d and return a 3d variation of the line
// // based on relative scale
// const COPLANAR_EPSILON = 1e-16;
// const _line0 = /* @__PURE__ */ new Line3();
// const _line1 = /* @__PURE__ */ new Line3();
// const _dir0 = /* @__PURE__ */ new Vector3();
// const _dir1 = /* @__PURE__ */ new Vector3();
// export function getOverlappingLine( line, triangle, lineTarget = new Line3() ) {

// 	if ( triangle.needsUpdate ) {

// 		triangle.update();

// 	}

// 	// if the triangle is degenerate then return no overlap
// 	if ( triangle.getArea() <= AREA_EPSILON ) {

// 		return null;

// 	}

// 	const { points, plane } = triangle;

// 	_line0.copy( line );
// 	_line0.delta( _dir0 ).normalize();

// 	// if the line and triangle are not coplanar then return no overlap
// 	const areCoplanar = Math.abs( plane.normal.dot( _dir0 ) ) < COPLANAR_EPSILON;
// 	if ( ! areCoplanar ) {

// 		return null;

// 	}

// 	// a plane that's orthogonal to the triangle that the line lies on the line
// 	_dir0.cross( plane.normal ).normalize();
// 	_orthoPlane.setFromNormalAndCoplanarPoint( _dir0, _line0.start );

// 	// find the line of intersection of the triangle along the plane if it exists
// 	let intersectCount = 0;
// 	for ( let i = 0; i < 3; i ++ ) {

// 		const p1 = points[ i ];
// 		const p2 = points[ ( i + 1 ) % 3 ];

// 		_edgeLine.start.copy( p1 );
// 		_edgeLine.end.copy( p2 );
// 		const startIntersects = Math.abs( _orthoPlane.distanceToPoint( _edgeLine.start ) ) < DIST_EPSILON;
// 		const endIntersects = Math.abs( _orthoPlane.distanceToPoint( _edgeLine.end ) ) < DIST_EPSILON;
// 		const edgeIntersects = _orthoPlane.intersectLine( _edgeLine, _point );

// 		if ( edgeIntersects && ! endIntersects || startIntersects ) {

// 			if ( startIntersects && ! edgeIntersects ) {

// 				_point.copy( _edgeLine.start );

// 			}

// 			if ( intersectCount === 0 ) {

// 				_line1.start.copy( _point );

// 			} else {

// 				_line1.end.copy( _point );

// 			}

// 			intersectCount ++;
// 			if ( intersectCount === 2 ) {

// 				break;

// 			}

// 		}

// 	}

// 	if ( intersectCount === 2 ) {

// 		// find the intersect line if any
// 		_line0.delta( _dir0 ).normalize();
// 		_line1.delta( _dir1 ).normalize();

// 		// swap edges so they're facing in the same direction
// 		if ( _dir0.dot( _dir1 ) < 0 ) {

// 			let tmp = _line1.start;
// 			_line1.start = _line1.end;
// 			_line1.end = tmp;

// 		}

// 		// check if the edges are overlapping
// 		const s1 = 0;
// 		const e1 = _vec.subVectors( _line0.end, _line0.start ).dot( _dir0 );
// 		const s2 = _vec.subVectors( _line1.start, _line0.start ).dot( _dir0 );
// 		const e2 = _vec.subVectors( _line1.end, _line0.start ).dot( _dir0 );
// 		const separated1 = e1 <= s2;
// 		const separated2 = e2 <= s1;

// 		if ( separated1 || separated2 ) {

// 			return null;

// 		}

// 		lineTarget.start
// 			.copy( _line0.start )
// 			.addScaledVector( _dir0, Math.max( s1, s2 ) );
// 		lineTarget.end
// 			.copy( _line0.start )
// 			.addScaledVector( _dir0, Math.min( e1, e2 ) );

// 		return lineTarget;

// 	}

// 	return null;

// }
