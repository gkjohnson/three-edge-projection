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
	MeshBasicMaterial,
	Mesh,
	DoubleSide,
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ProjectionGenerator, SilhouetteGenerator } from '../src';

const ANGLE_THRESHOLD = 50;
let renderer, camera, scene, gui, controls;
let model, outlines, group, silhouette;
let outputContainer;
let task = null;

init();

async function init() {

	outputContainer = document.getElementById( 'output' );

	const bgColor = 0x111111;

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
		.loadAsync( 'https://raw.githubusercontent.com/gkjohnson/3d-demo-data/main/models/3d-home-layout/scene.glb' );
	model = gltf.scene;
	group.updateMatrixWorld( true );

	// center model
	const box = new Box3();
	box.setFromObject( model, true );
	box.getCenter( group.position ).multiplyScalar( - 1 );
	group.position.y = Math.max( 0, - box.min.y ) + 1;
	group.add( model );
	model.visible = false;

	// create projection display mesh
	silhouette = new Mesh( new BufferGeometry(), new MeshBasicMaterial( {
		color: '#eee',
		polygonOffset: true,
		polygonOffsetFactor: 3,
		polygonOffsetUnits: 3,
		side: DoubleSide,
	} ) );
	outlines = new LineSegments( new BufferGeometry(), new LineBasicMaterial( { color: 0x030303 } ) );
	scene.add( outlines, silhouette );

	// camera setup
	camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 50 );
	camera.position.setScalar( 5.5 );
	camera.updateProjectionMatrix();

	// controls
	controls = new MapControls( camera, renderer.domElement );
	controls.zoomToCursor = true;
	controls.maxPolarAngle = Math.PI / 3;

	task = updateProjection();

	render();

	window.addEventListener( 'resize', function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}, false );

}

function* updateProjection() {

	outputContainer.innerText = 'processing: --';
	silhouette.visible = false;
	outlines.visible = false;

	// transform and merge geometries to project into a single model
	const geometries = [];
	model.updateWorldMatrix( true, true );
	model.traverse( c => {

		if ( c.geometry ) {

			const clone = c.geometry.clone();
			clone.applyMatrix4( c.matrixWorld );
			for ( const key in clone.attributes ) {

				if ( key !== 'position' ) {

					clone.deleteAttribute( key );

				}

			}

			geometries.push( clone );

		}

	} );
	const mergedGeometry = mergeGeometries( geometries, false );

	yield;

	// generate the silhouette
	let task, result, generator;
	generator = new SilhouetteGenerator();
	generator.sortTriangles = true;
	task = generator.generate( mergedGeometry, {

		onProgress: ( p, data ) => {

			outputContainer.innerText = `processing: ${ parseFloat( ( p * 100 ).toFixed( 2 ) ) }%`;
			silhouette.geometry.dispose();
			silhouette.geometry = data.getGeometry();
			silhouette.visible = true;

		},

	} );

	result = task.next();
	while ( ! result.done ) {

		result = task.next();
		yield;

	}

	silhouette.geometry.dispose();
	silhouette.geometry = result.value;
	silhouette.visible = true;
	outputContainer.innerText = 'generating intersection edges...';

	// generate the edges
	generator = new ProjectionGenerator();
	generator.angleThreshold = ANGLE_THRESHOLD;
	task = generator.generate( mergedGeometry, {

		onProgress: ( p, data ) => {

			outputContainer.innerText = `processing: ${ parseFloat( ( p * 100 ).toFixed( 2 ) ) }%`;
			outlines.geometry.dispose();
			outlines.geometry = data.getLineGeometry();
			outlines.visible = true;

		},

	} );

	result = task.next();
	while ( ! result.done ) {

		result = task.next();
		yield;

	}

	outlines.geometry.dispose();
	outlines.geometry = result.value;
	outlines.visible = true;
	outputContainer.innerText = '';

}


function render() {

	requestAnimationFrame( render );

	if ( task ) {

		const res = task.next();
		if ( res.done ) {

			task = null;

		}

	}

	renderer.render( scene, camera );

}
