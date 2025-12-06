import {
	BufferGeometry,
	Vector3,
	BufferAttribute,
	Mesh,
} from 'three';
import { MeshBVH, SAH } from 'three-mesh-bvh';
import { isYProjectedLineDegenerate } from './utils/triangleLineUtils.js';
import { overlapsToLines } from './utils/overlapUtils.js';
import { EdgeGenerator } from './EdgeGenerator.js';
import { edgesToGeometry } from './utils/edgesToGeometry.js';
import { bvhcastEdges } from './utils/bvhcastEdges.js';
import { getAllMeshes } from './utils/getAllMeshes.js';

// these shared variables are not used across "yield" boundaries in the
// generator so there's no risk of overwriting another tasks data
const UP_VECTOR = /* @__PURE__ */ new Vector3( 0, 1, 0 );

function toLineGeometry( edges ) {

	const edgeArray = new Float32Array( edges.length * 6 );
	let c = 0;
	for ( let i = 0, l = edges.length; i < l; i ++ ) {

		const line = edges[ i ];
		edgeArray[ c ++ ] = line[ 0 ];
		edgeArray[ c ++ ] = 0;
		edgeArray[ c ++ ] = line[ 2 ];
		edgeArray[ c ++ ] = line[ 3 ];
		edgeArray[ c ++ ] = 0;
		edgeArray[ c ++ ] = line[ 5 ];

	}

	const edgeGeom = new BufferGeometry();
	const edgeBuffer = new BufferAttribute( edgeArray, 3, true );
	edgeGeom.setAttribute( 'position', edgeBuffer );
	return edgeGeom;

}

class ProjectedEdgeCollector {

	constructor( scene ) {

		this.meshes = getAllMeshes( scene );
		this.bvhs = new Map();
		this.visibleEdges = [];
		this.hiddenEdges = [];
		this.iterationTime = 30;

	}

	reset() {

		this.visibleEdges.length = 0;
		this.hiddenEdges.length = 0;

	}

	getVisibleLineGeometry() {

		return toLineGeometry( this.visibleEdges );

	}

	getHiddenLineGeometry() {

		return toLineGeometry( this.hiddenEdges );


	}

	addEdges( edges ) {

		const currIterationTime = this.iterationTime;
		this.iterationTime = Infinity;

		const result = this.addEdgesGenerator( edges ).next().value;
		this.iterationTime = currIterationTime;

		return result;

	}

	// all edges are expected to be in world coordinates
	*addEdgesGenerator( edges ) {

		const { meshes, bvhs, visibleEdges, hiddenEdges, iterationTime } = this;
		let time = performance.now();
		for ( let i = 0; i < meshes.length; i ++ ) {

			if ( performance.now() - time > iterationTime ) {

				yield;
				time = performance.now();

			}

			const mesh = meshes[ i ];
			const geometry = mesh.geometry;
			if ( ! bvhs.has( geometry ) ) {

				const bvh = geometry.boundsTree || new MeshBVH( geometry );
				bvhs.set( geometry, bvh );

			}

		}

		// initialize hidden line object
		const hiddenOverlapMap = {};
		for ( let i = 0; i < edges.length; i ++ ) {

			hiddenOverlapMap[ i ] = [];

		}

		// construct bvh
		const edgesBvh = new MeshBVH( edgesToGeometry( edges ), { maxLeafTris: 2, strategy: SAH } );
		time = performance.now();
		for ( let m = 0; m < meshes.length; m ++ ) {

			if ( performance.now() - time > iterationTime ) {

				yield;
				time = performance.now();

			}

			// use bvhcast to compare all edges against all meshes
			const mesh = meshes[ m ];
			bvhcastEdges( edgesBvh, edges, bvhs.get( mesh.geometry ), mesh, hiddenOverlapMap );

		}

		// construct the projections
		for ( let i = 0; i < edges.length; i ++ ) {

			if ( performance.now() - time > iterationTime ) {

				yield;
				time = performance.now();

			}

			// convert the overlap points to proper lines
			const line = edges[ i ];
			const hiddenOverlaps = hiddenOverlapMap[ i ];
			overlapsToLines( line, hiddenOverlaps, false, visibleEdges );
			overlapsToLines( line, hiddenOverlaps, true, hiddenEdges );

		}

	}

}

export class ProjectionGenerator {

	constructor() {

		this.iterationTime = 30;
		this.angleThreshold = 50;
		this.includeIntersectionEdges = true;

	}

	generateAsync( geometry, options = {} ) {

		return new Promise( ( resolve, reject ) => {

			const { signal } = options;
			const task = this.generate( geometry, options );
			run();

			function run() {

				if ( signal && signal.aborted ) {

					reject( new Error( 'ProjectionGenerator: Process aborted via AbortSignal.' ) );
					return;

				}

				const result = task.next();
				if ( result.done ) {

					resolve( result.value );

				} else {

					requestAnimationFrame( run );

				}

			}


		} );

	}

	*generate( scene ) {

		const { iterationTime, angleThreshold, includeIntersectionEdges } = this;

		if ( scene.isBufferGeometry ) {

			scene = new Mesh( scene );

		}

		const edgeGenerator = new EdgeGenerator();
		edgeGenerator.iterationTime = iterationTime;
		edgeGenerator.thresholdAngle = angleThreshold;
		edgeGenerator.projectionDirection.copy( UP_VECTOR );

		let edges = yield* edgeGenerator.getEdgesGenerator( scene );
		if ( includeIntersectionEdges ) {

			yield* edgeGenerator.getIntersectionEdgesGenerator( scene, edges );

		}

		// filter out any degenerate projected edges
		edges = edges.filter( e => ! isYProjectedLineDegenerate( e ) );

		yield;

		const collector = new ProjectedEdgeCollector( scene );
		collector.iterationTime = iterationTime;
		yield* collector.addEdgesGenerator( edges );

		return collector;

	}

}
