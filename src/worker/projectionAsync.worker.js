import { BufferAttribute, BufferGeometry } from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { ProjectionGenerator } from '../ProjectionGenerator.js';

onmessage = function ( { data } ) {

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

		const { index, position, options } = data;
		const geometry = new BufferGeometry();
		geometry.setIndex( new BufferAttribute( index, 1, false ) );
		geometry.setAttribute( 'position', new BufferAttribute( position, 3, false ) );

		const bvh = new MeshBVH( geometry );
		const generator = new ProjectionGenerator();
		generator.sortEdges = options.sortEdges ?? generator.sortEdges;

		const task = generator.generate( bvh, {
			onProgress: onProgressCallback,
		} );
		let result;

		while ( result = task.next() ) {

			if ( result.done ) {

				break;

			}

		}

		const resultLines = result.value.attributes.position.array;
		postMessage( {

			result: resultLines,
			error: null,
			progress: 1,

		}, [ resultLines.buffer ] );

	} catch ( error ) {

		postMessage( {

			error,
			progress: 1,

		} );

	}

};
