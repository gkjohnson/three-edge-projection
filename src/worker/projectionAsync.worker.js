import { MeshBVH } from '../core/MeshBVH.js';
import { ProjectionGenerator } from '../ProjectionGenerator.js';

onmessage = function ( { geometry } ) {

	// TODO: deserialize geometry
	let prevTime = performance.now();
	function onProgressCallback( progress ) {

		const currTime = performance.now();
		if ( currTime - prevTime >= 10 || progress === 1.0 ) {

			postMessage( {

				error: null,
				progress,

			} );
			prevTime = currTime;

		}

	}

	try {

		const bvh = new MeshBVH( geometry );
		const generator = new ProjectionGenerator();
		const task = generator.generate( bvh, { onProgress: onProgressCallback } );
		let result;
		while ( result = task.next() ) {

			if ( result.done ) {

				break;

			}

		}

		// TODO: serialize geometry

		postMessage( {

			result: result.value,
			error: null,
			progress: 1,

		} );

	} catch ( error ) {

		postMessage( {

			error,
			progress: 1,

		} );

	}

};
