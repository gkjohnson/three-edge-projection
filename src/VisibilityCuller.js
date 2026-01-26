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
		const vec = new Vector3();
		const camera = new OrthographicCamera();
		const box = new Box3();
		const idMesh = new Mesh( undefined, new IDMaterial() );
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

		// set the target size
		box.getSize( vec );
		target.setSize( Math.ceil( vec.x / pixelsPerMeter ), Math.ceil( vec.y / pixelsPerMeter ) );

		// set the camera bounds
		camera.rotation.x = - Math.PI / 2;
		camera.left = box.min.x;
		camera.right = box.max.x;
		camera.top = box.max.z;
		camera.bottom = box.min.z;
		camera.far = box.max.y - box.min.y;
		camera.position.y = box.max.y;
		camera.updateProjectionMatrix();

		// save render state
		const color = renderer.getClearColor( new Color() );
		const alpha = renderer.getClearAlpha();
		const renderTarget = renderer.getRenderTarget();
		const autoClear = renderer.autoClear;

		// render ids
		renderer.autoClear = false;
		renderer.setClearColor( new Color( - 1, - 1, - 1 ), - 1 );
		renderer.setRenderTarget( target );
		renderer.clear();

		// TODO: we should be able to use a RED uint target here
		for ( let i = 0; i < objects.length; i ++ ) {

			const object = objects[ i ];
			idMesh.matrixAutoUpdate = false;
			idMesh.matrixWorldAutoUpdate = false;
			idMesh.matrixWorld.copy( object.matrixWorld );
			idMesh.geometry = object.geometry;

			idMesh.material.objectId = i;
			renderer.render( idMesh, camera );

		}

		const readBuffer = new Int32Array( target.width * target.height * 4 );
		await renderer.readRenderTargetPixelsAsync( target, 0, 0, target.width, target.height, readBuffer );

		// reset render state
		renderer.setClearColor( color, alpha );
		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = autoClear;

		// dispose of intermediate values
		idMesh.material.dispose();
		target.dispose();

		// find all visible objects
		const visibleSet = new Set();
		for ( let i = 0, l = readBuffer.length; i < l; i ++ ) {

			const id = readBuffer[ i ];
			if ( id !== - 1 ) {

				visibleSet.add( objects[ id ] );

			}

		}

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
				uniform int objectId;
				flat varying int vid;
				void main() {

					vid = objectId;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,

			fragmentShader: /* glsl */`
				layout(location = 0) out ivec4 out_id;
				flat varying int vid;

				void main() {

					out_id = ivec4( vid );

				}
			`,

		} );

		this.setValues( params );

	}

}
