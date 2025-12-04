import {
	Box3,
	WebGLRenderer,
	Scene,
	DirectionalLight,
	AmbientLight,
	Group,
	BufferGeometry,
	LineSegments,
	LineBasicMaterial,
	PerspectiveCamera,
	MeshStandardMaterial,
} from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ProjectionGenerator } from '..';
import { MeshBVH, SAH } from 'three-mesh-bvh';

const params = {
	displayModel: true,
	displayIntermediateProjection: true,
	displayDrawThroughProjection: false,
	includeIntersectionEdges: true,
	rotate: () => {

		group.quaternion.random();
		group.position.set( 0, 0, 0 );
		group.updateMatrixWorld( true );

		const box = new Box3();
		box.setFromObject( model, true );
		box.getCenter( group.position ).multiplyScalar( - 1 );
		group.position.y = Math.max( 0, - box.min.y ) + 1;

		needsRender = true;

		task = updateEdges();

	},
	regenerate: () => {

		task = updateEdges();

	},
};

const ANGLE_THRESHOLD = 50;
let needsRender = false;
let renderer, camera, scene, gui, controls;
let model, projection, drawThroughProjection, group;
let outputContainer;
let task = null;

init();

async function init() {

	outputContainer = document.getElementById( 'output' );

	const bgColor = 0xeeeeee;

	// renderer setup
	renderer = new WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( bgColor, 1 );
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
		.loadAsync( 'https://raw.githubusercontent.com/gkjohnson/3d-demo-data/main/models/nasa-m2020/Perseverance.glb' );
		// .loadAsync( new URL( './simple.glb', import.meta.url ).toString() );
	model = gltf.scene;

	model.traverse( c => {

		if ( c.material ) {

			c.material = new MeshStandardMaterial( { flatShading: true } );

		}

		if ( c.geometry && ! c.geometry.boundsTree ) {

			c.geometry.boundsTree = new MeshBVH( c.geometry, { maxLeafTris: 1, strategy: SAH } );

		}

	} );

	group.updateMatrixWorld( true );

	// center model
	const box = new Box3();
	box.setFromObject( model, true );
	box.getCenter( group.position ).multiplyScalar( - 1 );
	group.position.y = Math.max( 0, - box.min.y ) + 1;
	group.add( model );
	group.updateMatrixWorld( true );

	// create projection display mesh
	projection = new LineSegments( new BufferGeometry(), new LineBasicMaterial( { color: 0x030303, depthWrite: false } ) );
	drawThroughProjection = new LineSegments( new BufferGeometry(), new LineBasicMaterial( { color: 0xcacaca, depthWrite: false } ) );
	drawThroughProjection.renderOrder = - 1;
	scene.add( projection, drawThroughProjection );

	// camera setup
	camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1e3 );
	camera.position.setScalar( 3.5 ).multiplyScalar( 10 );
	camera.updateProjectionMatrix();

	needsRender = true;

	// controls
	controls = new OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', () => {

		needsRender = true;

	} );

	gui = new GUI();
	gui.add( params, 'displayModel' ).onChange( () => needsRender = true );
	gui.add( params, 'displayIntermediateProjection' ).onChange( () => needsRender = true );
	gui.add( params, 'displayDrawThroughProjection' ).onChange( () => needsRender = true );
	gui.add( params, 'includeIntersectionEdges' ).onChange( () => needsRender = true );
	gui.add( params, 'rotate' );
	gui.add( params, 'regenerate' ).onChange( () => needsRender = true );

	task = updateEdges();

	render();

	window.addEventListener( 'resize', function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		needsRender = true;

	}, false );

}

function* updateEdges( runTime = 30 ) {

	outputContainer.innerText = 'processing: --';

	// transform and merge geometries to project into a single model
	let timeStart = window.performance.now();
	if ( params.includeIntersectionEdges ) {

		outputContainer.innerText = 'processing: finding edge intersections...';
		projection.geometry.dispose();
		projection.geometry = new BufferGeometry();

	}

	// generate the candidate edges
	timeStart = window.performance.now();

	const generator = new ProjectionGenerator();
	generator.iterationTime = runTime;
	generator.angleThreshold = ANGLE_THRESHOLD;
	generator.includeIntersectionEdges = params.includeIntersectionEdges;

	const collection = yield* generator.generate( model );
	drawThroughProjection.geometry.dispose();
	drawThroughProjection.geometry = collection.getHiddenLineGeometry();

	projection.geometry.dispose();
	projection.geometry = collection.getVisibleLineGeometry();
	const geometry = projection.geometry;
	const trimTime = window.performance.now() - timeStart;

	projection.geometry.dispose();
	projection.geometry = geometry;
	outputContainer.innerText = `edge trimming   : ${ trimTime.toFixed( 2 ) }ms`;

	needsRender = true;

}


function render() {

	requestAnimationFrame( render );

	if ( task ) {

		const res = task.next();
		if ( res.done ) {

			task = null;

		}

	}

	model.visible = params.displayModel;
	drawThroughProjection.visible = params.displayDrawThroughProjection;

	if ( needsRender ) {

		renderer.render( scene, camera );
		needsRender = false;

	}

}
