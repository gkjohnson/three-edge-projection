import { globalId, storage, uniform } from 'three/tsl';
import { wgslTagFn, proxyFn } from 'three-mesh-bvh/webgpu';
import { ComputeKernel } from '../utils/ComputeKernel.js';
import { StorageBufferAttribute } from 'three/webgpu';
import { edgeStruct } from '../nodes/structs.wgsl.js';

// One thread per edge — traverses the BVH and writes overlap intervals directly
// to the overlaps buffer via atomic slot claiming.
export class EdgeOverlapsKernel extends ComputeKernel {

	constructor() {

		const params = {
			bvhData: { value: null },
			globalId: globalId,
			edgesToProcess: uniform( 1, 'uint' ),
			edges: storage( new StorageBufferAttribute( 1, 1, Uint32Array ), edgeStruct ).toReadOnly().setName( 'edges' ),
		};

		const edges = params.edges;
		const traversalFn = proxyFn( 'bvhData.value.fns.collectEdgeOverlaps', params );
		const shader = wgslTagFn/* wgsl */`
			fn compute( globalId: vec3u, edgesToProcess: u32 ) -> void {

				let edgeIndex = globalId.x;
				let edgeListLength = arrayLength( &${ edges } );
				if ( edgeIndex >= edgeListLength || edgeIndex >= edgesToProcess ) {

					return;

				}

				let edgeStart = vec3f(
					${ edges }[ edgeIndex ].start[ 0 ],
					${ edges }[ edgeIndex ].start[ 1 ],
					${ edges }[ edgeIndex ].start[ 2 ]
				);
				let edgeEnd = vec3f(
					${ edges }[ edgeIndex ].end[ 0 ],
					${ edges }[ edgeIndex ].end[ 1 ],
					${ edges }[ edgeIndex ].end[ 2 ]
				);

				${ traversalFn }( edgeIndex, edgeStart, edgeEnd );

			}
		`;

		super( shader( params ) );
		this.defineUniformAccessors( params );

	}

}
