import { Vector3, Matrix4 } from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { generateEdges } from './utils/generateEdges.js';
import { generateIntersectionEdges } from './utils/generateIntersectionEdges.js';

const _mat = /* @__PURE__ */ new Matrix4();

// Class for generating edges for use with the projection generator. Functions take geometries or
// Object3D instances. If an Object3D is passed then lines for all child meshes will be generated
// in world space
// TODO:
// - add support for progress functions
// - add support for inter-geometry intersection edge detection
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

		if ( geometry.isMesh ) {

			const meshes = getAllMeshes( geometry );
			let localProjection = null;
			if ( this.projectionDirection ) {

				localProjection = new Vector3();

			}

			for ( let i = 0; i < meshes.length; i ++ ) {

				const mesh = meshes[ i ];
				if ( localProjection ) {

					_mat.copy( mesh.matrixWorld ).invert();
					localProjection.applyMatrix4( _mat );

				}

				const results = yield* generateEdges( mesh.geometry, [], {
					projectionDirection: localProjection,
					thresholdAngle: this.thresholdAngle,
					iterationTime: this.iterationTime,
				} );

				transformEdges( results, mesh.matrixWorld );
				resultEdges.push( ...results );

			}

			return resultEdges;

		} else {

			return yield* generateEdges( geometry, resultEdges, {
				projectionDirection: this.projectionDirection,
				thresholdAngle: this.thresholdAngle,
				iterationTime: this.iterationTime,
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
		if ( geometry.isMesh ) {

			const meshes = getAllMeshes( geometry );
			for ( let i = 0; i < meshes.length; i ++ ) {

				const mesh = meshes[ i ];
				const results = yield* this.getIntersectionEdgesGenerator( mesh.geometry, [] );
				transformEdges( results, mesh.matrixWorld );
				resultEdges.push( ...results );

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

			return yield* generateIntersectionEdges( bvh, resultEdges, { iterationTime } );

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

		list[ i ].v0.applyMatrix4( matrix );
		list[ i ].v1.applyMatrix4( matrix );

	}

}
