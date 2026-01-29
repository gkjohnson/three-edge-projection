import {
	BufferGeometry,
	Vector3,
	BufferAttribute,
	Mesh,
	Line3,
	Box3,
	Raycaster,
} from 'three';
import { MeshBVH, SAH, acceleratedRaycast } from 'three-mesh-bvh';
import { isYProjectedLineDegenerate } from './utils/triangleLineUtils.js';
import { overlapsToLines } from './utils/overlapUtils.js';
import { EdgeGenerator } from './EdgeGenerator.js';
import { LineObjectsBVH } from './utils/LineObjectsBVH.js';
import { bvhcastEdges } from './utils/bvhcastEdges.js';
import { getAllMeshes } from './utils/getAllMeshes.js';

// these shared variables are not used across "yield" boundaries in the
// generator so there's no risk of overwriting another tasks data
const UP_VECTOR = /* @__PURE__ */ new Vector3( 0, 1, 0 );

const _raycaster = /* @__PURE__ */ new Raycaster();
const _line = /* @__PURE__ */ new Line3();
const _line0 = /* @__PURE__ */ new Line3();
const _line1 = /* @__PURE__ */ new Line3();
const _box = /* @__PURE__ */ new Box3();
const _point0 = /* @__PURE__ */ new Vector3();
const _point1 = /* @__PURE__ */ new Vector3();
const _dir0 = /* @__PURE__ */ new Vector3();
const _dir1 = /* @__PURE__ */ new Vector3();

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
		this.lineIntersectionStrategy = false;

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

	addEdges( ...args ) {

		const currIterationTime = this.iterationTime;
		this.iterationTime = Infinity;

		const result = this.addEdgesGenerator( ...args ).next().value;
		this.iterationTime = currIterationTime;

		return result;

	}

	// all edges are expected to be in world coordinates
	*addEdgesGenerator( edges, options = {} ) {

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
		const edgesBvh = new LineObjectsBVH( edges, { maxLeafSize: 2, strategy: SAH } );

		if ( this.lineIntersectionStrategy ) {

			// TODO: use objects bvh for scene to accelerate raycasts
			// TODO: cache inverse matrices to help speed things up

			meshes.forEach( c => {

				c.geometry.boundsTree = bvhs.get( c.geometry );
				c.raycast = acceleratedRaycast;

			} );

			const results = {};
			time = performance.now();
			for ( let i0 = 0, l = edgesBvh.lines.length; i0 < l; i0 ++ ) {

				if ( performance.now() - time > iterationTime ) {

					yield;
					time = performance.now();

				}

				// get the projected line
				const e0 = edgesBvh.lines[ i0 ];
				_line0.copy( e0 );
				_line0.start.y = 0;
				_line0.end.y = 0;

				// get the line direction
				_line0.delta( _dir0 ).normalize();

				// get the line bounds
				_box.makeEmpty();
				_box.expandByPoint( e0.start );
				_box.expandByPoint( e0.end );

				// expand the size
				_box.max.y = 1e5;
				_box.min.y = - 1e5;

				// reset the splits and
				edgesBvh.shapecast( {

					intersectsBounds( b ) {

						return _box.intersectsBox( b );

					},

					intersectsRange( offset, count ) {

						for ( let i1 = offset, l = offset + count; i1 < l; i1 ++ ) {

							if ( i1 <= i0 ) {

								continue;

							}

							if ( ! results[ i0 ] ) results[ i0 ] = [];
							if ( ! results[ i1 ] ) results[ i1 ] = [];

							// get the projected line
							const e1 = edgesBvh.lines[ i1 ];
							_line1.copy( e1 );
							_line1.start.y = 0;
							_line1.end.y = 0;

							// get projected direction
							_line1.delta( _dir1 ).normalize();

							// early out if parallel
							if ( Math.abs( _dir0.dot( _dir1 ) ) > 1 - 1e-5 ) {

								continue;

							}

							// get the intersection point
							const dist = _line0.distanceSqToLine3( _line1, _point0, _point1 );
							if ( dist < 1e-5 ) {

								// NOTE: only the second point from distanceSqToLine3 is valid due to a bug in r182 implementation
								results[ i0 ].push( _line0.closestPointToPointParameter( _point1 ) );
								results[ i1 ].push( _line1.closestPointToPointParameter( _point1 ) );

							}

						}

					}

				} );

			}

			// save out all the lines
			for ( let i = 0, l = edgesBvh.lines.length; i < l; i ++ ) {

				const line = edgesBvh.lines[ i ];
				pushFromSplits( line, results[ i ] || [], meshes, bvhs, visibleEdges, objectsBVH );

			}

		} else {

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

	*generate( scene, options ) {

		const { iterationTime, angleThreshold, includeIntersectionEdges } = this;
		const { onProgress = () => {} } = options;

		if ( scene.isBufferGeometry ) {

			scene = new Mesh( scene );

		}

		const edgeGenerator = new EdgeGenerator();
		edgeGenerator.iterationTime = iterationTime;
		edgeGenerator.thresholdAngle = angleThreshold;
		edgeGenerator.projectionDirection.copy( UP_VECTOR );

		onProgress( 'Extracting edges' );
		let edges = [];
		yield* edgeGenerator.getEdgesGenerator( scene, edges, options );
		if ( includeIntersectionEdges ) {

			onProgress( 'Extracting self-intersecting edges' );
			yield* edgeGenerator.getIntersectionEdgesGenerator( scene, edges, options );

		}

		// filter out any degenerate projected edges
		onProgress( 'Filtering edges' );
		edges = edges.filter( e => ! isYProjectedLineDegenerate( e ) );

		yield;

		const collector = new ProjectedEdgeCollector( scene );
		collector.iterationTime = iterationTime;

		onProgress( 'Clipping edges' );
		yield* collector.addEdgesGenerator( edges, {
			onProgress: ! onProgress ? null : ( prog, tot ) => {

				onProgress( 'Clipping edges', prog / tot, collector );

			},
		} );

		return collector;

	}

}

function pushFromSplits( line, splits, meshes, bvhs, target, objectsBVH ) {

	const hits = [];

	// sort the splits
	splits.push( 0, 1 );
	splits.sort( ( a, b ) => a - b );

	// iterate over splits
	_raycaster.firstHitOnly = true;
	for ( let i = 0; i < splits.length - 1; i ++ ) {

		const s0 = splits[ i ];
		const s1 = splits[ i + 1 ];
		if ( s0 === s1 ) {

			continue;

		}

		// set up the raycaster to project check the middle of the line
		const middle = ( s0 + s1 ) / 2;
		line.at( middle, _raycaster.ray.origin );
		_raycaster.ray.origin.y += 1e4;
		_raycaster.far = 1e4;
		_raycaster.ray.direction.set( 0, - 1, 0 );

		// perform the raycasting check
		let visible = true;
		for ( let m = 0, lm = meshes.length; m < lm; m ++ ) {

			const mesh = meshes[ m ];
			const bvh = bvhs.get( mesh.geometry );
			hits.length = 0;

			bvh.raycastObject3D( mesh, _raycaster, hits );
			if ( hits.length > 0 ) {

				visible = false;
				break;

			}

		}

		// if it's visible then save it
		if ( visible ) {

			line.at( s0, _line.start );
			line.at( s1, _line.end );

			target.push( new Float32Array( [
				_line.start.x, 0, _line.start.z,
				_line.end.x, 0, _line.end.z,
			] ) );

		}

	}

}
