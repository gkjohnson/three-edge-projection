import {
	ShaderMaterial,
	GLSL3,
	WebGLRenderTarget,
	Box3,
	Vector3,
	OrthographicCamera,
	Color,
	Mesh,
	NoBlending,
	DoubleSide,
} from 'three';

function decodeDepth( r, g, b ) {

	const byte = 256;
	const byte2 = byte * byte;
	const byte3 = byte2 * byte;

	return ( r * byte2 + g * byte + b ) / ( byte3 - 1 );

}

function decodeDepthBuffer( rgbaBuffer, depthBuffer, near, far, offset ) {

	const pixelCount = rgbaBuffer.length / 4;
	for ( let i = 0; i < pixelCount; i ++ ) {

		const rgbaIndex = i * 4;

		// alpha = 0 indicates background (no geometry)
		if ( rgbaBuffer[ rgbaIndex + 3 ] === 0 ) {

			depthBuffer[ i ] = - Infinity;

		} else {

			const normalizedDepth = decodeDepth( rgbaBuffer[ rgbaIndex ], rgbaBuffer[ rgbaIndex + 1 ], rgbaBuffer[ rgbaIndex + 2 ] );
			depthBuffer[ i ] = near + normalizedDepth * ( far - near ) + offset;

		}

	}

}

function contractDepthBuffer( width, height, depthBuffer, target ) {

	for ( let x = 0; x < width; x ++ ) {

		for ( let y = 0; y < height; y ++ ) {

			let z = Infinity;
			for ( let dx = - 1; dx <= 1; dx ++ ) {

				for ( let dy = - 1; dy <= 1; dy ++ ) {

					if ( x + dx < 0 || x + dx >= width ) continue;
					if ( y + dy < 0 || y + dy >= height ) continue;

					const i = ( x + dx ) + ( y + dy ) * width;
					const dz = depthBuffer[ i ];

					if ( dz < z ) z = dz;

				}

			}

			target[ x + y * width ] = z;

		}

	}

}

function collectAllMeshes( objects ) {

	const result = new Set();
	objects.traverse( c => {

		if ( c.isMesh ) {

			result.add( c );

		}

	} );

	return Array.from( result );

}

function isLineVisibleInTile( line, depthBuffer, tile ) {

	// TODO: clamp the lines to the tile bounds initially to avoid unnecessary iterations

	const { start, end } = line;
	const {
		minX, maxX,
		minY, maxY,
		pixelWidth,
		pixelHeight,
	} = tile;

	const worldToPixelX = pixelWidth / ( maxX - minX );
	const worldToPixelY = pixelHeight / ( maxY - minY );

	// skip lines entirely outside this tile
	const lineMinX = Math.min( start.x, end.x );
	const lineMaxX = Math.max( start.x, end.x );
	const lineMinY = Math.min( start.z, end.z );
	const lineMaxY = Math.max( start.z, end.z );

	if ( lineMaxX < minX || lineMinX >= maxX || lineMaxY < minY || lineMinY >= maxY ) {

		return false;

	}

	// convert line endpoints to pixel coordinates within this tile
	const x0 = ( start.x - minX ) * worldToPixelX;
	const y0 = ( start.z - minY ) * worldToPixelY;
	const x1 = ( end.x - minX ) * worldToPixelX;
	const y1 = ( end.z - minY ) * worldToPixelY;

	// DDA setup - step through every pixel the line crosses
	const dx = x1 - x0;
	const dy = y1 - y0;
	const steps = Math.ceil( Math.max( Math.abs( dx ), Math.abs( dy ) ) );

	// calculate the max height increase per pixel step to account for the line
	// potentially being higher elsewhere within the pixel than where we sample
	const heightPerStep = steps > 0 ? Math.abs( end.y - start.y ) / steps : 0;

	const point = new Vector3();

	for ( let s = 0; s <= steps; s ++ ) {

		const t = steps > 0 ? s / steps : 0;
		point.lerpVectors( start, end, t );

		const pixelX = Math.floor( ( point.x - minX ) * worldToPixelX );
		const pixelY = ( pixelHeight - 1 ) - Math.floor( ( point.z - minY ) * worldToPixelY );

		// check if pixel is within this tile
		if ( pixelX >= 0 && pixelX < pixelWidth && pixelY >= 0 && pixelY < pixelHeight ) {

			const index = pixelY * pixelWidth + pixelX;
			const depth = depthBuffer[ index ];

			// point is visible if the highest point of the line within this pixel is at or above the surface
			if ( point.y + heightPerStep >= depth ) {

				return true;

			}

		}

	}

	return false;

}

export class LineVisibilityCuller {

	constructor( renderer, options = {} ) {

		const {
			pixelsPerMeter = 0.1,
			depthEpsilon = 0.001,
		} = options;

		this.pixelsPerMeter = pixelsPerMeter;
		this.depthEpsilon = depthEpsilon;
		this.renderer = renderer;

	}

	async cull( objects, lines ) {

		const meshes = collectAllMeshes( objects );
		if ( meshes.length === 0 || lines.length === 0 ) {

			return lines;

		}

		const { renderer, pixelsPerMeter, depthEpsilon } = this;
		const size = new Vector3();
		const camera = new OrthographicCamera();
		const box = new Box3();
		const depthMesh = new Mesh( undefined, new DepthMaterial() );
		depthMesh.matrixAutoUpdate = false;
		depthMesh.matrixWorldAutoUpdate = false;

		const target = new WebGLRenderTarget( 1, 1 );

		// get the bounds of all meshes
		box.makeEmpty();
		meshes.forEach( o => {

			box.expandByObject( o );

		} );

		// add margin to avoid boundary issues (one pixel on each side)
		box.expandByScalar( pixelsPerMeter );

		// get the bounds dimensions
		box.getSize( size );

		// calculate the tile and target size
		const maxTextureSize = Math.min( renderer.capabilities.maxTextureSize, 2 ** 13 );
		const pixelWidth = Math.ceil( size.x / pixelsPerMeter );
		const pixelHeight = Math.ceil( size.z / pixelsPerMeter );
		const tilesX = Math.ceil( pixelWidth / maxTextureSize );
		const tilesY = Math.ceil( pixelHeight / maxTextureSize );

		const tileWidth = Math.ceil( pixelWidth / tilesX );
		const tileHeight = Math.ceil( pixelHeight / tilesY );
		target.setSize( tileWidth, tileHeight );

		// set the camera bounds
		camera.rotation.x = - Math.PI / 2;
		camera.near = 0;
		camera.far = size.y;
		camera.position.y = box.max.y;

		// save render state
		const prevColor = renderer.getClearColor( new Color() );
		const prevAlpha = renderer.getClearAlpha();
		const prevRenderTarget = renderer.getRenderTarget();
		const prevAutoClear = renderer.autoClear;

		// render depth
		renderer.autoClear = false;
		renderer.setClearColor( 0, 0 );
		renderer.setRenderTarget( target );

		const readBuffer = new Uint8Array( tileWidth * tileHeight * 4 );
		const depthBuffer = new Float32Array( tileWidth * tileHeight );
		const contractedBuffer = new Float32Array( tileWidth * tileHeight );
		const stepX = size.x / tilesX;
		const stepZ = size.z / tilesY;

		// track visibility per line - once visible, skip further checks
		const visibleSet = new Set();

		for ( let x = 0; x < tilesX; x ++ ) {

			for ( let y = 0; y < tilesY; y ++ ) {

				camera.left = box.min.x + stepX * x;
				camera.right = camera.left + stepX;

				camera.bottom = box.min.z + stepZ * y;
				camera.top = camera.bottom + stepZ;

				camera.updateProjectionMatrix();
				renderer.clear();

				// render all meshes with depth material
				for ( let i = 0; i < meshes.length; i ++ ) {

					const mesh = meshes[ i ];
					depthMesh.matrixWorld.copy( mesh.matrixWorld );
					depthMesh.geometry = mesh.geometry;
					renderer.render( depthMesh, camera );

				}

				// read back the depth buffer and decode it to world Y values
				// gl_FragCoord.z=0 is near plane (box.max.y), z=1 is far plane (box.min.y)
				await renderer.readRenderTargetPixelsAsync( target, 0, 0, tileWidth, tileHeight, readBuffer );

				decodeDepthBuffer( readBuffer, depthBuffer, box.max.y, box.min.y, - depthEpsilon );
				contractDepthBuffer( target.width, target.height, depthBuffer, contractedBuffer );

				// window.POINTS = new Points();
				// const points = Array.from( depthBuffer ).map( ( v, i ) => {

				// 	const px = i % target.width;
				// 	const py = Math.floor( i / target.width );

				// 	const x = MathUtils.mapLinear( px, 0, target.width, box.min.x, box.max.x ) + 1 / target.width;
				// 	const y = MathUtils.mapLinear( py, target.height, 0, box.min.z, box.max.z );

				// 	if ( v !== - Infinity ) {

				// 	} else {

				// 		return null;

				// 	}

				// 	return new Vector3( x, v, y );

				// } ).filter( v => v !== null );

				// POINTS.geometry.setFromPoints( points );


				// tile info for visibility checks
				const tile = {
					minX: camera.left,
					maxX: camera.right,
					minY: camera.bottom,
					maxY: camera.top,
					pixelWidth: target.width,
					pixelHeight: target.height,
				};

				// check line visibility against this tile
				for ( let i = 0; i < lines.length; i ++ ) {

					const line = lines[ i ];
					if ( ! visibleSet.has( line ) ) {

						const isVisible = isLineVisibleInTile( line, contractedBuffer, tile );
						if ( isVisible ) {

							visibleSet.add( line );

						}

					}

				}

			}

		}

		// reset render state
		renderer.setClearColor( prevColor, prevAlpha );
		renderer.setRenderTarget( prevRenderTarget );
		renderer.autoClear = prevAutoClear;

		// dispose of intermediate values
		depthMesh.material.dispose();
		target.dispose();

		return Array.from( visibleSet );

	}

}


class DepthMaterial extends ShaderMaterial {

	constructor( params ) {

		super( {

			glslVersion: GLSL3,
			blending: NoBlending,
			side: DoubleSide,

			vertexShader: /* glsl */`
				void main() {

					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,

			fragmentShader: /* glsl */`
				layout(location = 0) out vec4 out_depth;

				void main() {

					// gl_FragCoord.z is already normalized to [0, 1] based on camera near/far
					float byte = 256.0;
					float byte2 = byte * byte;
					float byte3 = byte2 * byte;
					float d = gl_FragCoord.z * ( byte3 - 1.0 );
					float r = floor( d / byte2 ) / 255.0;
					float g = floor( mod( d, byte2 ) / byte ) / 255.0;
					float b = mod( d, byte ) / 255.0;

					out_depth = vec4( r, g, b, 1.0 );

				}
			`,

		} );

		this.setValues( params );

	}

}
