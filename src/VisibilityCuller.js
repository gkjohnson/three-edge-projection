import {
	ShaderMaterial,
	GLSL3,
	WebGLRenderTarget,
	Box3,
	IntType,
	RGBAIntegerFormat,
	Vector3,
	OrthographicCamera,
	Color,
	Mesh,
} from 'three';

function collectAllObjects( objects ) {

	const result = new Set();
	objects.traverse( c => {

		if ( c.isMesh ) {

			result.add( c );

		}

	} );

	return Array.from( result );

}

// TODO: WebGPU or occlusion queries would let us accelerate this. Ideally would we "contract" the depth buffer by one pixel by
// taking the lowest value from all surrounding pixels in order to avoid mesh misses.
export class VisibilityCuller {

	constructor( renderer, options = {} ) {

		const { pixelsPerMeter = 0.1 } = options;

		this.pixelsPerMeter = pixelsPerMeter;
		this.renderer = renderer;

	}

	async cull( objects ) {

		objects = collectAllObjects( objects );

		const { renderer, pixelsPerMeter } = this;
		const size = new Vector3();
		const camera = new OrthographicCamera();
		const box = new Box3();
		const idMesh = new Mesh( undefined, new IDMaterial() );
		idMesh.matrixAutoUpdate = false;
		idMesh.matrixWorldAutoUpdate = false;

		const target = new WebGLRenderTarget( 1, 1, {
			type: IntType,
			format: RGBAIntegerFormat,
			internalFormat: 'RGBA32I',
		} );

		// get the bounds of the image
		box.makeEmpty();
		objects.forEach( o => {

			box.expandByObject( o );

		} );

		// get the bounds dimensions
		box.getSize( size );

		// calculate the tile and target size
		const maxTextureSize = Math.min( renderer.capabilities.maxTextureSize, 2 ** 13 );
		const pixelWidth = Math.ceil( size.x / pixelsPerMeter );
		const pixelHeight = Math.ceil( size.z / pixelsPerMeter );
		const tilesX = Math.ceil( pixelWidth / maxTextureSize );
		const tilesY = Math.ceil( pixelHeight / maxTextureSize );

		console.log( tilesX, tilesY );

		target.setSize( Math.ceil( pixelWidth / tilesX ), Math.ceil( pixelHeight / tilesY ) );

		// set the camera bounds
		camera.rotation.x = - Math.PI / 2;
		camera.far = box.max.y - box.min.y;
		camera.position.y = box.max.y;

		// save render state
		const color = renderer.getClearColor( new Color() );
		const alpha = renderer.getClearAlpha();
		const renderTarget = renderer.getRenderTarget();
		const autoClear = renderer.autoClear;

		// render ids
		renderer.autoClear = false;
		renderer.setClearColor( new Color( - 1, - 1, - 1 ), - 1 );
		renderer.setRenderTarget( target );

		console.log( target.width, target.height )
		const readBuffer = new Int32Array( target.width * target.height * 4 );
		const visibleSet = new Set();
		const stepX = size.x / tilesX;
		const stepY = size.z / tilesY;
		for ( let x = 0; x < tilesX; x ++ ) {

			for ( let y = 0; y < tilesY; y ++ ) {

				camera.left = box.min.x + stepX * x;
				camera.bottom = box.min.z + stepY * y;

				camera.right = camera.left + stepX;
				camera.top = camera.bottom + stepY;

				camera.updateProjectionMatrix();
				renderer.clear();

				// TODO: we should be able to use a RED uint target here
				for ( let i = 0; i < objects.length; i ++ ) {

					const object = objects[ i ];
					idMesh.matrixWorld.copy( object.matrixWorld );
					idMesh.geometry = object.geometry;

					idMesh.material.objectId = i;
					renderer.render( idMesh, camera );

				}

				// TODO: using promise.all here to wait for them to finish at the same time seems to be slower?
				await renderer
					.readRenderTargetPixelsAsync( target, 0, 0, target.width, target.height, readBuffer )
					.then( buffer => {

						// find all visible objects
						for ( let i = 0, l = buffer.length; i < l; i += 4 ) {

							const id = buffer[ i ];
							if ( id !== - 1 ) {

								visibleSet.add( objects[ id ] );

							}

						}

					} );

			}

		}

		// reset render state
		renderer.setClearColor( color, alpha );
		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = autoClear;

		// dispose of intermediate values
		idMesh.material.dispose();
		target.dispose();


		console.log( objects.length, visibleSet.size );
		return Array.from( visibleSet );

	}

}


class IDMaterial extends ShaderMaterial {

	get objectId() {

		return this.uniforms.objectId.value;

	}

	set objectId( v ) {

		this.uniforms.objectId.value = v;

	}

	constructor( params ) {

		super( {

			glslVersion: GLSL3,

			uniforms: {
				objectId: { value: 0 },
			},

			vertexShader: /* glsl */`
				void main() {

					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,

			fragmentShader: /* glsl */`
				layout(location = 0) out ivec4 out_id;
				uniform int objectId;

				void main() {

					out_id = ivec4( objectId );

				}
			`,

		} );

		this.setValues( params );

	}

}
