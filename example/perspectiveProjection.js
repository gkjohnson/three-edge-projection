import {
	Box3,
	Scene,
	DirectionalLight,
	AmbientLight,
	Group,
	BufferGeometry,
	LineSegments,
	LineBasicMaterial,
	PerspectiveCamera,
	WebGPURenderer,
	Vector3,
} from 'three/webgpu';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ProjectionGenerator as ProjectionGeneratorCompute } from 'three-edge-projection/webgpu';
import { ProjectionGenerator } from 'three-edge-projection';

const params = {
	displayModel: true,
	webGPU: false,
	displayDrawThroughProjection: false,
	includeIntersectionEdges: false,
	regenerate: () => {

		updateEdges();

	},
};

let needsRender = false;
let renderer, camera, scene, gui, controls;
let model, projection, drawThroughProjection, group, projectionGroup;
let outputContainer;
let abortController;

init();

async function init() {

	outputContainer = document.getElementById( 'output' );

	const bgColor = 0xeeeeee;

	// renderer setup
	renderer = new WebGPURenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( bgColor, 1 );
	await renderer.init();
	document.body.appendChild( renderer.domElement );

	// scene setup
	scene = new Scene();

	// lights
	const light = new DirectionalLight( 0xffffff, 3.5 );
	light.position.set( 1, 2, 3 );
	scene.add( light );

	const ambientLight = new AmbientLight( 0xb0bec5, 0.5 );
	scene.add( ambientLight );

	// load model
	group = new Group();
	scene.add( group );

	const gltf = await new GLTFLoader()
		.setMeshoptDecoder( MeshoptDecoder )
		.setDRACOLoader( new DRACOLoader() )
		.loadAsync( 'https://raw.githubusercontent.com/gkjohnson/3d-demo-data/main/models/nasa-m2020/Perseverance.glb' );
	model = gltf.scene;

	const box = new Box3();
	box.setFromObject( model, true );
	box.getCenter( group.position ).multiplyScalar( - 1 );
	group.position.y = Math.max( 0, - box.min.y );
	group.add( model );
	group.updateMatrixWorld( true );

	// create projection display meshes
	projection = new LineSegments( new BufferGeometry(), new LineBasicMaterial( { depthWrite: false } ) );
	drawThroughProjection = new LineSegments( new BufferGeometry(), new LineBasicMaterial( { depthWrite: false } ) );
	drawThroughProjection.renderOrder = - 1;
	projectionGroup = new Group();
	projectionGroup.add( projection, drawThroughProjection );
	scene.add( projectionGroup );

	// camera setup
	camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 100 );
	camera.position.setScalar( 3.5 );
	camera.updateProjectionMatrix();

	needsRender = true;

	// controls
	controls = new OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', () => {

		needsRender = true;

	} );

	gui = new GUI();
	const displayFolder = gui.addFolder( 'Display' );
	displayFolder.add( params, 'displayModel' ).onChange( () => needsRender = true ).listen();
	displayFolder.add( params, 'displayDrawThroughProjection' ).onChange( () => needsRender = true );

	const generationFolder = gui.addFolder( 'Generation' );
	generationFolder.add( params, 'webGPU' );
	generationFolder.add( params, 'includeIntersectionEdges' );
	generationFolder.add( params, 'regenerate' );

	render();

	updateEdges();

	window.addEventListener( 'resize', function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		needsRender = true;

	}, false );

}

async function updateEdges() {

	if ( abortController ) {

		abortController.abort();

	}

	abortController = new AbortController();

	projection.geometry.dispose();
	projection.material.dispose();
	projection.geometry = new BufferGeometry();

	drawThroughProjection.geometry.dispose();
	drawThroughProjection.material.dispose();
	drawThroughProjection.geometry = new BufferGeometry();

	needsRender = true;

	const timeStart = window.performance.now();

	// position the projectionGroup to map NDC output back to a camera-facing plane
	const FWD = new Vector3( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
	const distToCenter = - FWD.dot( camera.position ) + 1.75;
	const _v = new Vector3( 1, 1, 1 ).applyMatrix4( camera.projectionMatrixInverse );
	_v.multiplyScalar( distToCenter / _v.z );
	projectionGroup.rotation.copy( camera.rotation ).reorder( 'ZYX' );
	projectionGroup.rotation.x += Math.PI / 2;
	projectionGroup.scale.set( _v.x, 1, _v.y );
	projectionGroup.position.copy( camera.position ).addScaledVector( FWD, distToCenter );

	// construct the generation group — encodes camera VP matrix so the generator
	// projects along the camera's view direction instead of world Y
	const scaleGroup = new Group();
	const perspectiveGroup = new Group();
	perspectiveGroup.matrixAutoUpdate = false;
	scaleGroup.add( perspectiveGroup );

	model.visible = true;
	const clone = group.clone();
	perspectiveGroup.add( clone );

	clone.matrix
		.multiplyMatrices( camera.matrixWorldInverse, group.matrixWorld )
		.decompose( clone.position, clone.quaternion, clone.scale );

	perspectiveGroup.matrix.copy( camera.projectionMatrix );

	scaleGroup.scale.x = - 1;
	scaleGroup.rotation.x = Math.PI / 2;
	scaleGroup.updateMatrixWorld( true );

	// normalize scale so geometry is in a workable range for the GPU
	const box = new Box3();
	box.setFromObject( perspectiveGroup );
	scaleGroup.scale.z = 5 / ( box.max.y - box.min.y );
	scaleGroup.position.y = - box.min.y * scaleGroup.scale.z - 0.5;
	scaleGroup.updateMatrixWorld( true );

	const input = [ clone ];

	let result;
	try {

		const onProgress = ( p, msg ) => {

			outputContainer.innerText = `${ msg }... ${ ( p * 100 ).toFixed( 2 ) }%`;

		};

		const options = {
			signal: abortController.signal,
			onProgress,
		};

		if ( params.webGPU ) {

			const generator = new ProjectionGeneratorCompute( renderer );
			generator.includeIntersectionEdges = params.includeIntersectionEdges;
			result = await generator.generate( input, options );

		} else {

			const generator = new ProjectionGenerator();
			generator.includeIntersectionEdges = params.includeIntersectionEdges;
			result = await generator.generateAsync( input, options );

		}

	} catch {

		// cancelled
		return;

	}

	const visGeom = result.visibleEdges.getLineGeometry();
	const hidGeom = result.hiddenEdges.getLineGeometry();

	projection.geometry.dispose();
	projection.material.dispose();
	projection.geometry = visGeom;
	projection.material = new LineBasicMaterial( { color: 0x030303, depthWrite: false } );

	drawThroughProjection.geometry.dispose();
	drawThroughProjection.material.dispose();
	drawThroughProjection.geometry = hidGeom;
	drawThroughProjection.material = new LineBasicMaterial( { color: 0xcacaca, depthWrite: false } );

	const elapsed = window.performance.now() - timeStart;
	outputContainer.innerText = `Generation time: ${ elapsed.toFixed( 2 ) }ms`;

	needsRender = true;

}

function render() {

	requestAnimationFrame( render );

	model.visible = params.displayModel;
	drawThroughProjection.visible = params.displayDrawThroughProjection;

	if ( needsRender ) {

		renderer.render( scene, camera );
		needsRender = false;

	}

}
