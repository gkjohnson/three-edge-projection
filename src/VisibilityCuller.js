import {
	ShaderMaterial,
	GLSL3,
	WebGLRenderTarget,
	Box3,
	Vector3,
	Vector4,
	OrthographicCamera,
	Color,
	Mesh,
	NoBlending,
} from 'three';

// RGBA8 ID encoding - supports up to 16,777,215 objects (2^24 - 1)
// ID 0 is valid, background is indicated by alpha = 0
function encodeId( id, target ) {

	target.x = ( id & 0xFF ) / 255;
	target.y = ( ( id >> 8 ) & 0xFF ) / 255;
	target.z = ( ( id >> 16 ) & 0xFF ) / 255;
	target.w = 1;

}

function decodeId( buffer, index ) {

	return buffer[ index ] | ( buffer[ index + 1 ] << 8 ) | ( buffer[ index + 2 ] << 16 );

}

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

		const target = new WebGLRenderTarget( 1, 1 );

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
		renderer.setClearColor( 0, 0 );
		renderer.setRenderTarget( target );

		const readBuffer = new Uint8Array( target.width * target.height * 4 );
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

				for ( let i = 0; i < objects.length; i ++ ) {

					const object = objects[ i ];
					idMesh.matrixWorld.copy( object.matrixWorld );
					idMesh.geometry = object.geometry;

					idMesh.material.objectId = i;
					renderer.render( idMesh, camera );

				}

				await renderer
					.readRenderTargetPixelsAsync( target, 0, 0, target.width, target.height, readBuffer )
					.then( buffer => {

						// find all visible objects - decode RGBA to ID
						for ( let i = 0, l = buffer.length; i < l; i += 4 ) {

							// alpha = 0 indicates background (no object)
							if ( buffer[ i + 3 ] === 0 ) continue;

							const id = decodeId( buffer, i );
							visibleSet.add( objects[ id ] );

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

	set objectId( v ) {

		encodeId( v, this.uniforms.objectId.value );

	}

	constructor( params ) {

		super( {

			glslVersion: GLSL3,
			blending: NoBlending,

			uniforms: {
				objectId: { value: new Vector4() },
			},

			vertexShader: /* glsl */`
				void main() {

					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,

			fragmentShader: /* glsl */`
				layout(location = 0) out vec4 out_id;
				uniform vec4 objectId;

				void main() {

					out_id = objectId;

				}
			`,

		} );

		this.setValues( params );

	}

}
