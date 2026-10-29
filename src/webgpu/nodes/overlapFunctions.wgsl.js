import { wgslTagFn } from 'three-mesh-bvh/webgpu';
import { constants } from './common.wgsl.js';
import { TriWGSL, LineWGSL, PlaneWGSL } from './primitives.js';
import { clipResultStruct } from './structs.wgsl.js';

const { PARALLEL_EPSILON, AREA_EPSILON, DIST_THRESHOLD, VERTEX_EPSILON } = constants;

// Clips triangle (a, b, c) against a plane (plane.xyz = normal, plane.w = constant,
// equation: dot(normal, p) + constant >= 0 is the kept side).
// Returns 0, 1, or 2 sub-triangles covering the kept portion.
export const clipTriangleToPlane = wgslTagFn/* wgsl */`
	fn clipTriangleToPlane( a: vec3f, b: vec3f, c: vec3f, plane: vec4f ) -> ${ clipResultStruct } {

		var result: ${ clipResultStruct };

		let da = dot( plane.xyz, a ) + plane.w;
		let db = dot( plane.xyz, b ) + plane.w;
		let dc = dot( plane.xyz, c ) + plane.w;

		let aKept = da >= 0.0;
		let bKept = db >= 0.0;
		let cKept = dc >= 0.0;
		let keptCount = u32( aKept ) + u32( bKept ) + u32( cKept );

		// all kept - return the original triangle
		if ( keptCount == 3u ) {

			result.count = 1u;
			result.a0 = a;
			result.b0 = b;
			result.c0 = c;
			return result;

		}

		// all discarded
		if ( keptCount == 0u ) {

			return result;

		}

		// vertex positions and plane distances packed into arrays for index-based access
		let pts   = array<vec3f, 3>( a, b, c );
		let dists = array<f32, 3>( da, db, dc );

		if ( keptCount == 1u ) {

			// apex is the lone kept vertex; the other two are clipped away
			var apexIdx = 0u;
			if ( bKept ) {

				apexIdx = 1u;

			} else if ( cKept ) {

				apexIdx = 2u;

			}

			let apex = pts[ apexIdx ];
			let clipped0 = pts[ ( apexIdx + 1u ) % 3u ];
			let clipped1 = pts[ ( apexIdx + 2u ) % 3u ];

			let apexDist = dists[ apexIdx ];
			let clipped0Dist = dists[ ( apexIdx + 1u ) % 3u ];
			let clipped1Dist = dists[ ( apexIdx + 2u ) % 3u ];

			// parametric intersection along apex->clipped0 and apex->clipped1
			let t0 = apexDist / ( apexDist - clipped0Dist );
			let t1 = apexDist / ( apexDist - clipped1Dist );

			result.count = 1u;
			result.a0 = apex;
			result.b0 = mix( apex, clipped0, t0 );
			result.c0 = mix( apex, clipped1, t1 );
			return result;

		}

		// the lone discarded vertex is cut off, leaving a quad that we split into two triangles
		var discardedIdx = 2u;
		if ( ! aKept ) {

			discardedIdx = 0u;

		} else if ( ! bKept ) {

			discardedIdx = 1u;

		}

		// kept0 and kept1 are the two vertices on the kept side; discarded is the one being cut off
		let kept0 = pts[ ( discardedIdx + 1u ) % 3u ];
		let kept1 = pts[ ( discardedIdx + 2u ) % 3u ];
		let discarded = pts[ discardedIdx ];

		let kept0Dist = dists[ ( discardedIdx + 1u ) % 3u ];
		let kept1Dist = dists[ ( discardedIdx + 2u ) % 3u ];
		let discardedDist = dists[ discardedIdx ];

		// parametric intersections along kept0->discarded and kept1->discarded
		let t0 = kept0Dist / ( kept0Dist - discardedDist );
		let t1 = kept1Dist / ( kept1Dist - discardedDist );

		let edge0Cut = mix( kept0, discarded, t0 );
		let edge1Cut = mix( kept1, discarded, t1 );

		// quad (kept0, kept1, edge1Cut, edge0Cut) split into two triangles
		result.count = 2u;
		result.a0 = kept0;
		result.b0 = kept1;
		result.c0 = edge1Cut;
		result.a1 = kept0;
		result.b1 = edge1Cut;
		result.c1 = edge0Cut;
		return result;

	}
`;

// Clips the edge (lineStart -> lineEnd) to the portion lying at or below the
// plane of triangle (a, b, c). The plane is always treated as up-facing.
// Returns TrimResult.valid = false if the entire edge is above the plane.
export const trimToBeneathTriPlane = wgslTagFn/* wgsl */`
	fn trimToBeneathTriPlane( tri: ${ TriWGSL.struct }, line: ${ LineWGSL.struct }, output: ptr<function, ${ LineWGSL.struct }> ) -> bool {

		// compute the triangle plane, ensuring the normal faces up
		let triNormal = ${ TriWGSL.getNormal }( tri );
		var plane = ${ PlaneWGSL.fromNormalAndCoplanarPoint }( triNormal, tri.a );
		if ( plane.normal.y < 0.0 ) {

			plane.normal *= - 1.0;
			plane.constant *= - 1.0;

		}

		let startDist = ${ PlaneWGSL.distanceToPoint }( plane, line.start );
		let endDist = ${ PlaneWGSL.distanceToPoint }( plane, line.end );

		let isStartOnPlane = abs( startDist ) < ${ PARALLEL_EPSILON };
		let isEndOnPlane = abs( endDist ) < ${ PARALLEL_EPSILON };

		let isStartBelow = ! isStartOnPlane && startDist < 0.0;
		let isEndBelow = ! isEndOnPlane && endDist < 0.0;

		// coplanar/parallel - only valid if the line is below the plane
		let lineDir = normalize( line.end - line.start );
		if ( abs( dot( plane.normal, lineDir ) ) < ${ PARALLEL_EPSILON } ) {

			// if the line is definitely above or on the plane then skip it
			if ( isStartOnPlane || ! isStartBelow ) {

				return false;

			} else {

				output.start = line.start;
				output.end = line.end;
				return true;

			}

		}

		if ( isStartBelow && isEndBelow ) {

			// both below - keep the full edge
			output.start = line.start;
			output.end = line.end;
			return true;

		} else if ( ! isStartBelow && ! isEndBelow ) {

			// both above - discard
			return false;

		} else {

			// straddling - clip at the plane intersection
			let t = - startDist / ( endDist - startDist );
			let planeHit = mix( line.start, line.end, t );

			if ( isStartBelow ) {

				output.start = line.start;
				output.end = planeHit;
				return true;

			} else if ( isEndBelow ) {

				output.end = line.end;
				output.start = planeHit;
				return true;

			}

		}

		return false;

	}
`;

// Returns the parametric overlap [t0, t1] of the edge (lineStart -> lineEnd)
// against triangle (a, b, c) projected onto the XZ plane.
// t0 and t1 are in [0, 1] along the original edge. valid = false if no overlap.
export const getProjectedOverlapRange = wgslTagFn/* wgsl */`
	fn getProjectedOverlapRange( line: ${ LineWGSL.struct }, tri: ${ TriWGSL.struct }, output: ptr<function, ${ LineWGSL.struct }> ) -> bool {

		// project everything to XZ
		var _tri = tri;
		_tri.a.y = 0.0;
		_tri.b.y = 0.0;
		_tri.c.y = 0.0;

		var _line = line;
		_line.start.y = 0.0;
		_line.end.y = 0.0;

		// skip degenerate projected triangles
		if ( ${ TriWGSL.getArea }( _tri ) <= ${ AREA_EPSILON } ) {

			return false;

		}

		var dir = _line.end - _line.start;
		let lineDistance = length( dir );
		dir = dir / lineDistance;

		// cutting plane: orthogonal to the edge direction in XZ, passing through ls
		let normal = ${ TriWGSL.getNormal }( _tri );
		let orthoNormal = normalize( cross( dir, normal ) );
		let orthoPlane = ${ PlaneWGSL.fromNormalAndCoplanarPoint }( orthoNormal, _line.start );

		// find the two intersections of triangle edges with the cutting plane
		var intersectCount = 0u;
		var triLineStart = vec3f( 0.0 );
		var triLineEnd = vec3f( 0.0 );

		let triPts = array<vec3f, 3>( _tri.a, _tri.b, _tri.c );
		for ( var i = 0u; i < 3u; i ++ ) {

			let p1 = triPts[ i ];
			let p2 = triPts[ ( i + 1u ) % 3u ];

			let distToStart = ${ PlaneWGSL.distanceToPoint }( orthoPlane, p1 );
			let distToEnd = ${ PlaneWGSL.distanceToPoint }( orthoPlane, p2 );

			let startIntersects = abs( distToStart ) < ${ DIST_THRESHOLD };
			let endIntersects = abs( distToEnd ) < ${ DIST_THRESHOLD };

			// check of the edge intersects
			var point = vec3f( 0.0 );
			if ( startIntersects && endIntersects ) {

				continue;

			} else if ( startIntersects ) {

				point = p1;

			} else if ( endIntersects ) {

				continue;

			} else if ( ( distToStart < 0.0 ) == ( distToEnd < 0.0 ) ) {

				continue;

			} else {

				let t = distToStart / ( distToStart - distToEnd );
				point = mix( p1, p2, t );

			}

			if ( intersectCount == 0u ) {

				triLineStart = point;

			} else if ( intersectCount == 1u ) {

				triLineEnd = point;

			}

			intersectCount ++;
			if ( intersectCount == 2u ) {

				break;

			}

		}

		if ( intersectCount == 2u ) {

			let triDir = normalize( triLineEnd - triLineStart );
			if ( dot( dir, triDir ) < 0.0 ) {

				let tmp = triLineStart;
				triLineStart = triLineEnd;
				triLineEnd = tmp;

			}

			// project both segments onto dir and compute the overlap
			let s1 = 0.0;
			let e1 = dot( _line.end - _line.start, dir );
			let s2 = dot( triLineStart - _line.start, dir );
			let e2 = dot( triLineEnd - _line.start, dir );
			let separated1 = e1 <= s2;
			let separated2 = e2 <= s1;

			if ( separated1 || separated2 ) {

				return false;

			}

			output.start = mix( line.start, line.end, max( s1, s2 ) / lineDistance );
			output.end = mix( line.start, line.end, min( e1, e2 ) / lineDistance );

			return true;

		}

		return false;

	}
`;


// Returns true if the edge (lineStart -> lineEnd) lies entirely along the Y axis
// when projected to XZ — i.e. the line direction is nearly (0, ±1, 0).
export const isYProjectedLineDegenerate = wgslTagFn/* wgsl */`
	fn isYProjectedLineDegenerate( lineStart: vec3f, lineEnd: vec3f ) -> bool {

		let dir = normalize( lineEnd - lineStart );
		return abs( dir.y ) >= 1.0 - ${ VERTEX_EPSILON };

	}
`;

// Returns true if both endpoints of the edge (lineStart -> lineEnd) coincide
// with two vertices of triangle (a, b, c) — i.e. the edge is a triangle edge.
export const isLineTriangleEdge = wgslTagFn/* wgsl */`
	fn isLineTriangleEdge( tri: ${ TriWGSL.struct }, line: ${ LineWGSL.struct } ) -> bool {

		let triPts = array<vec3f, 3>( tri.a, tri.b, tri.c );
		var startMatches = false;
		var endMatches = false;

		let start = line.start;
		let end = line.end;
		for ( var i = 0u; i < 3u; i ++ ) {

			// dot is sq length
			let tp = triPts[ i ];
			let ds = start - tp;
			let de = end - tp;
			if ( ! startMatches && dot( ds, ds ) <= ${ VERTEX_EPSILON } ) {

				startMatches = true;

			}

			if ( ! endMatches && dot( de, de ) <= ${ VERTEX_EPSILON } ) {

				endMatches = true;

			}

			if ( startMatches && endMatches ) {

				return true;

			}

		}

		return startMatches && endMatches;

	}
`;
