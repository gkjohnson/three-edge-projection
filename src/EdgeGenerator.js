import { Vector3, Matrix4 } from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { generateEdges } from './utils/generateEdges.js';
import { generateIntersectionEdges } from './utils/generateIntersectionEdges.js';

const _BtoA = /* @__PURE__ */ new Matrix4();
const _toLocalMatrix = /* @__PURE__ */ new Matrix4();

// Class for generating edges for use with the projection generator. Functions take geometries or
// Object3D instances. If an Object3D is passed then lines for all child meshes will be generated
// in world space
// TODO:
// - add support for progress functions
export class EdgeGenerator {

	constructor() {

		this.projectionDirection = new Vector3( 0, 1, 0 );
		this.thresholdAngle = 50;
		this.iterationTime = 30;

	}

	// Functions for generating the "hard" and silhouette edges of the geometry along the projection direction
	getEdges( ...args ) {

		const currIterationTime = this.iterationTime;
		this.iterationTime = Infinity;

		const result = this.getEdgesGenerator( ...args ).next().value;
		this.iterationTime = currIterationTime;

		return result;

	}

	*getEdgesGenerator( geometry, resultEdges = [] ) {

		const { projectionDirection, thresholdAngle, iterationTime } = this;
		if ( geometry.isObject3D ) {

			const meshes = getAllMeshes( geometry );
			let localProjection = null;
			if ( projectionDirection ) {

				localProjection = new Vector3();

			}

			let time = performance.now();
			for ( let i = 0; i < meshes.length; i ++ ) {

				if ( time - performance.now() > iterationTime ) {

					yield;

				}

				const mesh = meshes[ i ];
				if ( localProjection ) {

					_toLocalMatrix.copy( mesh.matrixWorld ).invert();
					localProjection
						.copy( projectionDirection )
						.transformDirection( _toLocalMatrix )
						.normalize();

				}

				const results = yield* generateEdges( mesh.geometry, [], {
					projectionDirection: localProjection,
					thresholdAngle: thresholdAngle,
					iterationTime: iterationTime,
				} );

				transformEdges( results, mesh.matrixWorld );

				// push the edges individually to avoid stack overflow
				for ( let i = 0; i < results.length; i ++ ) {

					resultEdges.push( results[ i ] );

				}

			}

			return resultEdges;

		} else {

			return yield* generateEdges( geometry, resultEdges, {
				projectionDirection: projectionDirection,
				thresholdAngle: thresholdAngle,
				iterationTime: iterationTime,
			} );

		}

	}

	// Functions for generating a set of "intersection" edges within an existing geometry
	// TODO: these needs to support generating "intersection edges" within a set of other geometries, as well
	getIntersectionEdges( ...args ) {

		const currIterationTime = this.iterationTime;
		this.iterationTime = Infinity;

		const result = this.getIntersectionEdgesGenerator( ...args ).next().value;
		this.iterationTime = currIterationTime;

		return result;

	}

	*getIntersectionEdgesGenerator( geometry, resultEdges = [] ) {

		const { iterationTime } = this;
		if ( geometry.isObject3D ) {

			// get the bounds trees from all geometry
			const meshes = getAllMeshes( geometry );
			const bvhs = new Map();
			let time = performance.now();
			for ( let i = 0; i < meshes.length; i ++ ) {

				if ( performance.now() - time > iterationTime ) {

					yield;
					time = performance.now();

				}

				const mesh = meshes[ i ];
				const geometry = mesh.geometry;
				if ( ! bvhs.has( geometry ) ) {

					const bvh = geometry.boundsTree || new MeshBVH( geometry, { maxLeafTris: 1 } );
					bvhs.set( geometry, bvh );

				}

			}

			// check each mesh against all others
			time = performance.now();
			for ( let i = 0; i < meshes.length; i ++ ) {

				for ( let j = i; j < meshes.length; j ++ ) {

					if ( performance.now() - time > iterationTime ) {

						yield;
						time = performance.now();

					}

					const meshA = meshes[ i ];
					const meshB = meshes[ j ];
					const bvhA = bvhs.get( meshA.geometry );
					const bvhB = bvhs.get( meshB.geometry );

					// A-1 * B * v
					_BtoA
						.copy( meshA.matrixWorld )
						.invert()
						.multiply( meshB.matrixWorld );

					const results = yield* generateIntersectionEdges( bvhA, bvhB, _BtoA, [], { iterationTime } );
					transformEdges( results, meshA.matrixWorld );

					// push the edges individually to avoid stack overflow
					for ( let i = 0; i < results.length; i ++ ) {

						resultEdges.push( results[ i ] );

					}


				}

			}

			return resultEdges;

		} else {

			let bvh;
			if ( geometry.isBufferGeometry ) {

				bvh = geometry.boundsTree || new MeshBVH( geometry, { maxLeafTris: 1 } );

			} else {

				bvh = geometry;
				geometry = bvh.geometry;

			}

			_BtoA.identity();
			return yield* generateIntersectionEdges( bvh, bvh, _BtoA, resultEdges, { iterationTime } );

		}

	}

}

function getAllMeshes( scene ) {

	let meshes = [];
	scene.traverse( c => {

		if ( c.geometry ) {

			meshes.push( c );

		}

	} );

	return meshes;

}

function transformEdges( list, matrix ) {

	for ( let i = 0; i < list.length; i ++ ) {

		list[ i ].applyMatrix4( matrix );

	}

}
