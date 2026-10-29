import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { MeshBVH, SAH } from 'three-mesh-bvh';
import * as OBC from '@thatopen/components';
import { WebGPURenderer } from 'three/webgpu';
import { ProjectionGenerator } from 'three-edge-projection/webgpu';
import { MeshVisibilityCuller } from 'three-edge-projection';

const params = {
	displayModel: true,
	useVisibilityCull: true,
	displayDrawThroughProjection: false,
	includeIntersectionEdges: false,
	rotate: () => {

		const randomQuaternion = new THREE.Quaternion();
		randomQuaternion.random();

		allMeshes.quaternion.copy( randomQuaternion );
		allMeshes.position.set( 0, 0, 0 );
		allMeshes.updateMatrixWorld( true );

	},
	regenerate: () => {

		updateEdges();

	},
};

const ANGLE_THRESHOLD = 50;
let gui;
let projection, drawThroughProjection;
let outputContainer;

// Separate WebGPU renderer for compute (OBC's renderer is WebGL)
const gpuRenderer = new WebGPURenderer();
await gpuRenderer.init();

const glRenderer = new THREE.WebGLRenderer();

const components = new OBC.Components();
const worlds = components.get( OBC.Worlds );
const container = document.getElementById( 'container' );

const world = worlds.create();

world.scene = new OBC.SimpleScene( components );
world.renderer = new OBC.SimpleRenderer( components, container );
world.camera = new OBC.OrthoPerspectiveCamera( components );

components.init();

world.scene.setup();

outputContainer = document.getElementById( 'output' );

// prettier-ignore
const githubUrl =
	'https://thatopen.github.io/engine_fragment/resources/worker.mjs';
const fetchedUrl = await fetch( githubUrl );
const workerBlob = await fetchedUrl.blob();
const workerFile = new File( [ workerBlob ], 'worker.mjs', { type: 'text/javascript' } );
const workerUrl = URL.createObjectURL( workerFile );
const fragments = components.get( OBC.FragmentsManager );
fragments.init( workerUrl );

world.camera.controls.addEventListener( 'control', () =>
	fragments.core.update( true ),
);

// Remove z fighting
fragments.core.models.materials.list.onItemSet.add( ( { value: material } ) => {

	if ( ! ( 'isLodMaterial' in material && material.isLodMaterial ) ) {

		material.polygonOffset = true;
		material.polygonOffsetUnits = 1;
		material.polygonOffsetFactor = Math.random();

	}

} );

async function loadModel( url, id = url, raw = false ) {

	const fetched = await fetch( url );
	const buffer = await fetched.arrayBuffer();

	const model = await fragments.core.load( buffer, {
		modelId: id,
		camera: world.camera.three,
		raw,
	} );

	world.scene.three.add( model.object );
	const now = performance.now();
	await fragments.core.update( true );
	const then = performance.now();
	console.log( `Time taken: ${ then - now }ms` );

	return model;

}

const model = await loadModel( '/frags/metal.frag' );

const allMeshes = new THREE.Group();

const material = new THREE.MeshLambertMaterial( {
	color: new THREE.Color( 'white' ),
} );

// Add picking meshes (deduplicating geometries to save memory)
const idsWithGeometry = await model.getItemsIdsWithGeometry();
const allMeshesData = await model.getItemsGeometry( idsWithGeometry );

const geometries = new Map();

// Get category data to split edges by category
const categoriesWithGeometry = await model.getItemsWithGeometryCategories() || [];
const itemsByCat = await model.getItemsOfCategories( categoriesWithGeometry.map( cat => new RegExp( cat ) ) );
const catKeys = Object.keys( itemsByCat );
const catColorIndex = new Map( catKeys.map( ( k, i ) => [ k, i ] ) );
const itemsCatIndex = new Map();
let catIndex = 0;
for ( const cat in itemsByCat ) {

	for ( const id of itemsByCat[ cat ] ) {

		itemsCatIndex.set( id, catIndex );

	}

	catIndex ++;

}

for ( const itemId in allMeshesData ) {

	const meshData = allMeshesData[ itemId ];
	for ( const geomData of meshData ) {

		if (
			! geomData.positions ||
			! geomData.indices ||
			! geomData.transform ||
			! geomData.representationId
		) {

			continue;

		}

		const representationId = geomData.representationId;
		if ( ! geometries.has( representationId ) ) {

			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				'position',
				new THREE.Float32BufferAttribute( geomData.positions, 3 ),
			);
			geometry.setAttribute(
				'normal',
				new THREE.Float32BufferAttribute( geomData.normals, 3 ),
			);
			geometry.setIndex( Array.from( geomData.indices ) );
			geometries.set( representationId, geometry );

		}

		const geometry = geometries.get( representationId );

		const mesh = new THREE.Mesh( geometry, material );

		const catIdx = itemsCatIndex.get( geomData.localId );
		mesh.userData.category = catKeys[ catIdx ];

		mesh.applyMatrix4( geomData.transform );
		mesh.applyMatrix4( model.object.matrixWorld );
		mesh.updateWorldMatrix( true, true );
		allMeshes.add( mesh );

	}

}

// initialize BVHs
allMeshes.traverse( c => {

	if ( c.geometry && ! c.geometry.boundsTree ) {

		const elCount = c.geometry.index ? c.geometry.index.count : c.geometry.attributes.position.count;
		c.geometry.groups.forEach( group => {

			if ( group.count === Infinity ) {

				group.count = elCount - group.start;

			}

		} );

		c.geometry.boundsTree = new MeshBVH( c.geometry, { targetLeafSize: 1, strategy: SAH } );

	}

} );

// Compute bounding box of allMeshes
allMeshes.updateWorldMatrix( true, true );
const box = new THREE.Box3();
allMeshes.traverse( ( child ) => {

	if ( child.isMesh && child.geometry ) {

		child.updateWorldMatrix( false, false );
		box.expandByObject( child, true );

	}

} );

const size = box.getSize( new THREE.Vector3() );
const center = box.getCenter( new THREE.Vector3() );

const planeHeight = box.max.y + 3;
const planeSize = Math.max( size.x, size.z ) * 1.5;
const planeGeometry = new THREE.PlaneGeometry( planeSize, planeSize );
const planeMaterial = new THREE.MeshBasicMaterial( {
	color: world.scene.three.background,
	transparent: true,
	opacity: 0.9,
} );
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.rotation.x = - Math.PI / 2;
plane.position.set( center.x, planeHeight, center.z );
world.scene.three.add( plane );

// prettier-ignore
const GROUP_PALETTE = [
	new THREE.Color( 0xe6194b ), new THREE.Color( 0x3cb44b ), new THREE.Color( 0x4363d8 ),
	new THREE.Color( 0xf58231 ), new THREE.Color( 0x911eb4 ), new THREE.Color( 0x42d4f4 ),
	new THREE.Color( 0xf032e6 ), new THREE.Color( 0xbfef45 ), new THREE.Color( 0xfabed4 ),
	new THREE.Color( 0x469990 ), new THREE.Color( 0xdcbeff ), new THREE.Color( 0x9a6324 ),
	new THREE.Color( 0x800000 ), new THREE.Color( 0xaaffc3 ), new THREE.Color( 0x808000 ),
	new THREE.Color( 0x000075 ), new THREE.Color( 0xa9a9a9 ), new THREE.Color( 0xffe119 ),
	new THREE.Color( 0xff6f61 ), new THREE.Color( 0x6b5b95 ), new THREE.Color( 0x88b04b ),
	new THREE.Color( 0xf7cac9 ), new THREE.Color( 0x92a8d1 ), new THREE.Color( 0x955251 ),
	new THREE.Color( 0xb565a7 ), new THREE.Color( 0x009b77 ), new THREE.Color( 0xdd4124 ),
	new THREE.Color( 0x45b8ac ), new THREE.Color( 0xefc050 ), new THREE.Color( 0x5b5ea6 ),
	new THREE.Color( 0x9b2335 ), new THREE.Color( 0xdfcfbe ), new THREE.Color( 0x55b4b0 ),
	new THREE.Color( 0xe15d44 ), new THREE.Color( 0x7fcdcd ), new THREE.Color( 0xbc243c ),
	new THREE.Color( 0xc3447a ), new THREE.Color( 0x98b4d4 ), new THREE.Color( 0xf0c05a ),
	new THREE.Color( 0x6667ab ), new THREE.Color( 0xd2691e ), new THREE.Color( 0x2e8b57 ),
	new THREE.Color( 0xcd5c5c ), new THREE.Color( 0x4682b4 ), new THREE.Color( 0xdaa520 ),
	new THREE.Color( 0x8b008b ), new THREE.Color( 0x556b2f ), new THREE.Color( 0xff4500 ),
];

function applyGroupColors( geometry, edgeSet ) {

	const vertexCount = geometry.getAttribute( 'position' ).count;
	const colorArray = new Float32Array( vertexCount * 3 );

	for ( const mesh of edgeSet.meshToSegments.keys() ) {

		const range = edgeSet.getRangeForMesh( mesh );
		if ( ! range ) continue;

		const color = GROUP_PALETTE[ ( catColorIndex.get( mesh.userData.category ) ?? 0 ) % GROUP_PALETTE.length ];
		for ( let v = range.start; v < range.start + range.count; v ++ ) {

			colorArray[ v * 3 ] = color.r;
			colorArray[ v * 3 + 1 ] = color.g;
			colorArray[ v * 3 + 2 ] = color.b;

		}

	}

	geometry.setAttribute( 'color', new THREE.BufferAttribute( colorArray, 3 ) );

}

const projectionMaterial = new THREE.LineBasicMaterial( { vertexColors: true } );
projection = new THREE.LineSegments( new THREE.BufferGeometry(), projectionMaterial );
projection.position.y = planeHeight + 0.01;

drawThroughProjection = new THREE.LineSegments( new THREE.BufferGeometry(), new THREE.LineDashedMaterial( { color: 0x444444, dashSize: 0.03, gapSize: 0.03, transparent: true } ) );
drawThroughProjection.position.y = planeHeight + 0.01;
drawThroughProjection.renderOrder = - 1;
world.scene.three.add( projection, drawThroughProjection );

gui = new GUI();
gui.add( params, 'useVisibilityCull' );
gui.add( params, 'includeIntersectionEdges' );
gui.add( params, 'displayDrawThroughProjection' );
gui.add( params, 'rotate' );
gui.add( params, 'regenerate' );

world.renderer.onBeforeUpdate.add( () => {

	drawThroughProjection.visible = params.displayDrawThroughProjection;

} );

async function updateEdges() {

	outputContainer.innerText = 'Generating...';

	// dispose the geometry
	projection.geometry.dispose();
	drawThroughProjection.geometry.dispose();

	// initialize an empty geometry
	projection.geometry = new THREE.BufferGeometry();
	drawThroughProjection.geometry = new THREE.BufferGeometry();

	const timeStart = window.performance.now();
	const generator = new ProjectionGenerator( gpuRenderer );
	generator.angleThreshold = ANGLE_THRESHOLD;
	generator.includeIntersectionEdges = params.includeIntersectionEdges;

	let input;
	if ( params.useVisibilityCull ) {

		// Using WebGPURenderer vs WebGL for culling currently takes significantly longer with
		// many meshes due to TSL processing time.
		// input = await new MeshVisibilityCuller( gpuRenderer, { pixelsPerMeter: 0.05 } ).cull( allMeshes );
		input = await new MeshVisibilityCuller( glRenderer, { pixelsPerMeter: 0.05 } ).cull( allMeshes );

	} else {

		input = allMeshes;

	}

	const collection = await generator.generate( input, {
		onProgress: ( p, msg ) => {

			outputContainer.innerText = msg;
			if ( p ) outputContainer.innerText += ' ' + ( 100 * p ).toFixed( 1 ) + '%';

		},
	} );

	drawThroughProjection.geometry.dispose();
	drawThroughProjection.geometry = collection.hiddenEdges.getLineGeometry();
	drawThroughProjection.computeLineDistances();

	projection.geometry.dispose();
	projection.geometry = collection.visibleEdges.getLineGeometry();
	applyGroupColors( projection.geometry, collection.visibleEdges );

	const trimTime = window.performance.now() - timeStart;
	outputContainer.innerText = `Generation time: ${ trimTime.toFixed( 2 ) }ms`;

}

updateEdges();
