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
} from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader.js';
import { LDrawConditionalLineMaterial } from 'three/examples/jsm/materials/LDrawConditionalLineMaterial.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ProjectionGenerator } from '..';
import { MeshBVH, SAH } from 'three-mesh-bvh';

const params = {
	displayModel: true,
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
		group.updateMatrixWorld( true );

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

	window.ROOT = group;

	if ( window.location.hash === '#lego' ) {

		// init loader
		const loader = new LDrawLoader();
		loader.setConditionalLineMaterial( LDrawConditionalLineMaterial );
		await loader.preloadMaterials( 'https://raw.githubusercontent.com/gkjohnson/ldraw-parts-library/master/colors/ldcfgalt.ldr' );

		// load model
		model = await loader
			.setPartsLibraryPath( 'https://raw.githubusercontent.com/gkjohnson/ldraw-parts-library/master/complete/ldraw/' )
			.loadAsync( 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/ldraw/officialLibrary/models/1621-1-LunarMPVVehicle.mpd_Packed.mpd' );

		// adjust model transforms
		model.scale.setScalar( 0.01 );
		model.rotation.x = Math.PI;

		// remove lines
		const toRemove = [];
		model.traverse( c => {

			if ( c.isLine ) {

				toRemove.push( c );

			}

		} );

		toRemove.forEach( c => {

			c.removeFromParent();

		} );

	} else {

		const gltf = await new GLTFLoader()
			.setMeshoptDecoder( MeshoptDecoder )
			.loadAsync( 'https://raw.githubusercontent.com/gkjohnson/3d-demo-data/main/models/nasa-m2020/Perseverance.glb' );
		model = gltf.scene;

	}

	// initialize BVHs
	model.traverse( c => {

		if ( c.geometry && ! c.geometry.boundsTree ) {

			c.geometry.clearGroups();
			c.geometry.boundsTree = new MeshBVH( c.geometry, { maxLeafTris: 1, strategy: SAH } );

		}

	} );

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
	camera.position.setScalar( 3.5 );//.multiplyScalar( 10 );
	camera.updateProjectionMatrix();

	needsRender = true;

	// controls
	controls = new OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', () => {

		needsRender = true;

	} );

	gui = new GUI();
	gui.add( params, 'displayModel' ).onChange( () => needsRender = true );
	gui.add( params, 'displayDrawThroughProjection' ).onChange( () => needsRender = true );
	gui.add( params, 'includeIntersectionEdges' ).onChange( () => needsRender = true );
	gui.add( params, 'rotate' );
	gui.add( params, 'regenerate' ).onChange( () => needsRender = true );

	render();

	task = updateEdges();

	window.addEventListener( 'resize', function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		needsRender = true;

	}, false );

}

function* updateEdges( runTime = 30 ) {

	outputContainer.innerText = 'Generating...';

	// dispose the geometry
	projection.geometry.dispose();
	drawThroughProjection.geometry.dispose();

	// initialize an empty geometry
	projection.geometry = new BufferGeometry();
	drawThroughProjection.geometry = new BufferGeometry();

	const timeStart = window.performance.now();
	const generator = new ProjectionGenerator();
	generator.iterationTime = runTime;
	generator.angleThreshold = ANGLE_THRESHOLD;
	generator.includeIntersectionEdges = params.includeIntersectionEdges;

	const collection = yield* generator.generate( model, {
		onProgress: ( msg, tot, edges ) => {

			outputContainer.innerText = msg;
			if ( tot ) outputContainer.innerText += ' ' + ( 100 * tot ).toFixed( 1 ) + '%';

			if ( edges ) {

				projection.geometry.dispose();
				projection.geometry = edges.getVisibleLineGeometry();
				needsRender = true;

			}

		},
	} );
	drawThroughProjection.geometry.dispose();
	drawThroughProjection.geometry = collection.getHiddenLineGeometry();

	projection.geometry.dispose();
	projection.geometry = collection.getVisibleLineGeometry();
	const geometry = projection.geometry;
	const trimTime = window.performance.now() - timeStart;

	projection.geometry.dispose();
	projection.geometry = geometry;
	outputContainer.innerText = `Generation time: ${ trimTime.toFixed( 2 ) }ms`;

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
