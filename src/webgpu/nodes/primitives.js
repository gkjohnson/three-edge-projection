import { StructTypeNode } from 'three/webgpu';
import { wgslTagFn } from 'three-mesh-bvh/webgpu';

const lineStruct = new StructTypeNode( {
	start: 'vec3',
	end: 'vec3',
} );

const triStruct = new StructTypeNode( {
	a: 'vec3',
	b: 'vec3',
	c: 'vec3',
} );

const planeStruct = new StructTypeNode( {
	normal: 'vec3',
	constant: 'float',
} );

export const LineWGSL = {
	struct: lineStruct,
};

export const TriWGSL = {
	struct: triStruct,
	getNormal: wgslTagFn/* wgsl */`
		fn tri_getNormal( tri: ${ triStruct } ) -> vec3f {

			let n = cross( tri.c - tri.b, tri.a - tri.b );
			let lenSq = dot( n, n );
			if ( lenSq < 1e-12 ) {

				return vec3( 0.0 );

			}

			return n * inverseSqrt( lenSq );

		}
	`,
	getArea: wgslTagFn/* wgsl */`
		fn tri_getArea( tri: ${ triStruct } ) -> f32 {

			let n = cross( tri.c - tri.b, tri.a - tri.b );
			let lenSq = dot( n, n );
			return sqrt( lenSq ) * 0.5;

		}
	`
};

export const PlaneWGSL = {
	struct: planeStruct,
	fromNormalAndCoplanarPoint: wgslTagFn/* wgsl */`
		fn plane_fromNormalAndCoplanarPoint( norm: vec3f, point: vec3f ) -> ${ planeStruct } {

			var plane: ${ planeStruct };
			plane.normal = norm;
			plane.constant = - dot( point, norm );
			return plane;

		}
	`,
	distanceToPoint: wgslTagFn/* wgsl */`
		fn plane_distanceToPoint( plane: ${ planeStruct }, point: vec3f ) -> f32 {

			return dot( plane.normal, point ) + plane.constant;

		}
	`,
};
