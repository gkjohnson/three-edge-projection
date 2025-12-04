import { Line3, Ray, Vector3 } from 'three';
import { insertOverlap } from './getProjectedOverlaps';

// TODO: not needed

const _delta = /* @__PURE__ */ new Vector3();
const _ray = /* @__PURE__ */ new Ray();

function edgeToRay( edge, ray, reverse = false ) {

	const { origin, direction } = ray;

	edge.delta( direction );
	if ( reverse ) {

		direction.multiplyScalar( - 1 );

	}

	direction.normalize();
	origin.copy( edge.start ).addScaledVector( direction, direction.dot( origin ) );

}

function hashVector( v ) {

	return `${ v.x.toFixed( 5 ) }_${ v.y.toFixed( 5 ) }_${ v.z.toFixed( 5 ) }`;

}

function hashRay( r ) {

	return `${ hashVector( r.origin ) }|${ hashVector( r.direction ) }`;

}

// function for merging a set of edges together
export function mergeEdges( edges ) {

	const info = {};
	for ( let i = 0, l = edges.length; i < l; i ++ ) {

		const edge = edges[ i ];

		edgeToRay( edge, _ray );
		let hash = hashRay( _ray );
		if ( ! ( hash in info ) ) {

			edgeToRay( edge, _ray, true );
			hash = hashRay( _ray );

		}

		if ( ! ( hash in info ) ) {

			info[ hash ] = {
				ray: _ray.clone(),
				overlaps: []
			};

		}

		const { ray, overlaps } = info[ hash ];
		const { origin, direction } = ray;
		let range = [
			_delta.subVectors( edge.start, origin ).dot( direction ),
			_delta.subVectors( edge.end, origin ).dot( direction ),
		];

		if ( range[ 0 ] > range[ 1 ] ) {

			[ range[ 0 ], range[ 1 ] ] = [ range[ 1 ], range[ 0 ] ];

		}

		insertOverlap( range, overlaps );

	}

	const results = [];
	for ( const key in info ) {

		const { ray, overlaps } = info[ key ];
		for ( let i = 0, l = overlaps.length; i < l; i ++ ) {

			const range = overlaps[ i ];
			const line = new Line3();

			ray.at( range[ 0 ], line.start );
			ray.at( range[ 1 ], line.end );

			results.push( line );

		}

	}

	return results;

}
