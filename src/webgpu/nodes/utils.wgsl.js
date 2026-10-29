import { wgslTagFn, bvhNodeBoundsStruct } from 'three-mesh-bvh/webgpu';

// Transform all 8 corners of a BVH bounding box by the given matrix and
// return the world-space AABB that encloses the result.
export const transformBVHBounds = wgslTagFn/* wgsl */`
	fn transformBVHBounds( bounds: ${ bvhNodeBoundsStruct }, matrix: mat4x4f ) -> ${ bvhNodeBoundsStruct } {

		let bMin = bounds.min;
		let bMax = bounds.max;
		var wMin = vec3f( 3e38, 3e38, 3e38 );
		var wMax = vec3f( - 3e38, - 3e38, - 3e38 );
		for ( var ci = 0u; ci < 8u; ci = ci + 1u ) {

			let corner = vec3f(
				select( bMin[ 0 ], bMax[ 0 ], ( ci & 1u ) != 0u ),
				select( bMin[ 1 ], bMax[ 1 ], ( ci & 2u ) != 0u ),
				select( bMin[ 2 ], bMax[ 2 ], ( ci & 4u ) != 0u )
			);
			var wc = matrix * vec4f( corner, 1.0 );
			wc = wc / wc.w;
			wMin = min( wMin, wc.xyz );
			wMax = max( wMax, wc.xyz );

		}

		var result: ${ bvhNodeBoundsStruct };
		result.min[ 0 ] = wMin.x;
		result.min[ 1 ] = wMin.y;
		result.min[ 2 ] = wMin.z;

		result.max[ 0 ] = wMax.x;
		result.max[ 1 ] = wMax.y;
		result.max[ 2 ] = wMax.z;
		return result;

	}
`;
