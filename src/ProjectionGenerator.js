/** @import { Object3D } from 'three' */
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
import { LineObjectsBVH } from './utils/LineObjectsBVH.js';
import { bvhcastEdges } from './utils/bvhcastEdges.js';
import { getAllMeshes } from './utils/getAllMeshes.js';
import { nextFrame } from './utils/nextFrame.js';

const UP_VECTOR = /* @__PURE__ */ new Vector3( 0, 1, 0 );

function toLineGeometry( edges, ranges = null ) {

	// if no ranges provided, treat the whole array as one range
	const activeRanges = ranges ?? [ { start: 0, count: edges.length } ];

	let totalCount = 0;
	for ( let i = 0; i < activeRanges.length; i ++ ) {

		totalCount += activeRanges[ i ].count;

	}

	const edgeArray = new Float32Array( totalCount * 6 );
	let c = 0;
	for ( let r = 0; r < activeRanges.length; r ++ ) {

		const { start, count } = activeRanges[ r ];
		for ( let i = start, l = start + count; i < l; i ++ ) {

			const line = edges[ i ];
			edgeArray[ c ++ ] = line[ 0 ];
			edgeArray[ c ++ ] = 0;
			edgeArray[ c ++ ] = line[ 2 ];
			edgeArray[ c ++ ] = line[ 3 ];
			edgeArray[ c ++ ] = 0;
			edgeArray[ c ++ ] = line[ 5 ];

		}

	}

	const edgeGeom = new BufferGeometry();
	const edgeBuffer = new BufferAttribute( edgeArray, 3, false );
	edgeGeom.setAttribute( 'position', edgeBuffer );
	return edgeGeom;

}

/**
 * Set of projected edges produced by ProjectionGenerator.
 */
export class EdgeSet {

	constructor() {

		this.meshToSegments = new Map();
		this._rangeCache = null;

	}

	/**
	 * Returns a new BufferGeometry representing the edges.
	 *
	 * Pass a list of meshes in to extract edges from a specific subset of meshes in the given
	 * order. Returns all edges if null.
	 * @param {Array<Mesh>|null} [meshes=null]
	 * @returns {BufferGeometry}
	 */
	getLineGeometry( meshes = null ) {

		const activeMeshes = meshes !== null ? meshes : Array.from( this.meshToSegments.keys() );
		const segments = [];
		for ( let i = 0; i < activeMeshes.length; i ++ ) {

			const segs = this.meshToSegments.get( activeMeshes[ i ] );
			if ( segs ) {

				for ( let j = 0; j < segs.length; j ++ ) segments.push( segs[ j ] );

			}

		}

		return toLineGeometry( segments );

	}

	/**
	 * Returns the range of vertices associated with the given mesh in the geometry returned from
	 * getLineGeometry. The `start` value is only relevant if lines are generated with the default
	 * order and set of meshes.
	 *
	 * Can be used to add extra vertex attributes in a geometry associated with a specific subrange
	 * of the geometry.
	 * @param {Mesh} mesh
	 * @returns {{ start: number, count: number }|null}
	 */
	getRangeForMesh( mesh ) {

		if ( ! this._rangeCache ) {

			this._rangeCache = new Map();
			let start = 0;
			for ( const [ m, segs ] of this.meshToSegments ) {

				this._rangeCache.set( m, { start: start * 2, count: segs.length * 2 } );
				start += segs.length;

			}

		}

		return this._rangeCache.get( mesh ) ?? null;

	}

}

/**
 * Result object returned by ProjectionGenerator containing visible and hidden edge sets.
 */
export class ProjectionResult {

	constructor() {

		/** @type {EdgeSet} */
		this.visibleEdges = new EdgeSet();

		/** @type {EdgeSet} */
		this.hiddenEdges = new EdgeSet();

	}

}

class ProjectedEdgeCollector {

	constructor( scene ) {

		this.meshes = getAllMeshes( scene );
		this.bvhs = new Map();
		this.result = new ProjectionResult();
		this.iterationTime = 30;

	}

	addEdges( ...args ) {

		const currIterationTime = this.iterationTime;
		this.iterationTime = Infinity;

		const result = this.addEdgesGenerator( ...args ).next().value;
		this.iterationTime = currIterationTime;

		return result;

	}

	// all edges are expected to be in world coordinates
	*addEdgesGenerator( edges, options = {} ) {

		const { meshes, bvhs, iterationTime } = this;
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
		const edgesBvh = new LineObjectsBVH( edges, { targetLeafSize: 2, strategy: SAH } );

		time = performance.now();
		for ( let m = 0; m < meshes.length; m ++ ) {

			if ( performance.now() - time > iterationTime ) {

				if ( options.onProgress ) {

					options.onProgress( m, meshes.length );

				}

				yield;
				time = performance.now();

			}

			// use bvhcast to compare all edges against all meshes
			const mesh = meshes[ m ];
			bvhcastEdges( edgesBvh, bvhs.get( mesh.geometry ), mesh, hiddenOverlapMap );

		}

		// construct the projections
		const { result } = this;
		for ( let i = 0; i < edges.length; i ++ ) {

			if ( performance.now() - time > iterationTime ) {

				yield;
				time = performance.now();

			}

			// convert the overlap points to proper lines
			const line = edges[ i ];
			const mesh = line.mesh;
			const hiddenOverlaps = hiddenOverlapMap[ i ];

			if ( ! result.visibleEdges.meshToSegments.has( mesh ) ) {

				result.visibleEdges.meshToSegments.set( mesh, [] );
				result.hiddenEdges.meshToSegments.set( mesh, [] );

			}

			overlapsToLines( line, hiddenOverlaps, false, result.visibleEdges.meshToSegments.get( mesh ) );
			overlapsToLines( line, hiddenOverlaps, true, result.hiddenEdges.meshToSegments.get( mesh ) );

		}

	}

}

/**
 * @callback ProjectionProgressCallback
 * @param {number} percent
 * @param {string} message
 */

/**
 * Utility for generating 2D projections of 3D geometry.
 */
export class ProjectionGenerator {

	constructor() {

		/**
		 * How long to spend trimming edges before yielding.
		 * @type {number}
		 */
		this.iterationTime = 30;

		/**
		 * The threshold angle in degrees at which edges are generated.
		 * @type {number}
		 */
		this.angleThreshold = 50;

		/**
		 * Whether to generate edges representing the intersections between triangles.
		 * @type {boolean}
		 */
		this.includeIntersectionEdges = true;

	}

	/**
	 * Generate the geometry with a promise-style API.
	 * @async
	 * @param {Object3D|BufferGeometry|Array<Object3D>} geometry
	 * @param {Object} [options]
	 * @param {ProjectionProgressCallback} [options.onProgress]
	 * @param {AbortSignal} [options.signal]
	 * @returns {ProjectionResult}
	 */
	async generateAsync( geometry, options = {} ) {

		const { signal } = options;
		const task = this.generate( geometry, options );
		let res;
		while ( ! res || ! res.done ) {

			res = task.next();
			await nextFrame();

			signal.throwIfAborted();

		}

		return res.value;

	}

	/**
	 * Generate the edge geometry result using a generator function.
	 * @param {Object3D|BufferGeometry|Array<Object3D>} scene
	 * @param {Object} [options]
	 * @param {ProjectionProgressCallback} [options.onProgress]
	 * @yields {void}
	 * @returns {ProjectionResult}
	 */
	*generate( scene, options = {} ) {

		const { iterationTime, angleThreshold, includeIntersectionEdges } = this;
		const { onProgress = () => {} } = options;

		if ( scene.isBufferGeometry ) {

			scene = new Mesh( scene );

		}

		const edgeGenerator = new EdgeGenerator();
		edgeGenerator.iterationTime = iterationTime;
		edgeGenerator.thresholdAngle = angleThreshold;
		edgeGenerator.projectionDirection.copy( UP_VECTOR );

		onProgress( 0, 'Extracting edges' );
		let edges = [];
		yield* edgeGenerator.getEdgesGenerator( scene, edges );
		if ( includeIntersectionEdges ) {

			onProgress( 0, 'Extracting self-intersecting edges' );
			yield* edgeGenerator.getIntersectionEdgesGenerator( scene, edges );

		}

		// filter out any degenerate projected edges
		onProgress( 0, 'Filtering edges' );
		edges = edges.filter( e => ! isYProjectedLineDegenerate( e ) );

		edges.sort( ( a, b ) => {

			const uuidA = a.mesh.uuid;
			const uuidB = b.mesh.uuid;
			if ( uuidA === uuidB ) {

				return 0;

			} else {

				return uuidA < uuidB ? - 1 : 1;

			}

		} );

		yield;

		const collector = new ProjectedEdgeCollector( scene );
		collector.iterationTime = iterationTime;

		onProgress( 0, 'Clipping edges' );
		yield* collector.addEdgesGenerator( edges, {
			onProgress: ! onProgress ? null : ( prog, tot ) => {

				onProgress( prog / tot, 'Clipping edges', collector.result );

			},
		} );

		return collector.result;

	}

}

