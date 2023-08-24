import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { MeshBVH } from 'three-mesh-bvh';
import { ProjectionGenerator } from '..';

const params = {
	displayModel: 'color',
	displayEdges: false,
	displayProjection: true,
	useBVH: true,
	sortEdges: true,
	rotate: () => {

		group.quaternion.random();
		group.position.set( 0, 0, 0 );
		group.updateMatrixWorld( true );

		const box = new THREE.Box3();
		box.setFromObject( model, true );
		box.getCenter( group.position ).multiplyScalar( - 1 );
		group.position.y = Math.max( 0, - box.min.y ) + 1;

	},
	regenerate: () => {

		task = updateEdges();

	},
};

let renderer, camera, scene, gui, controls;
let lines, model, projection, group, whiteModel;
let outputContainer;
let task = null;

init();

async function init() {

	outputContainer = document.getElementById( 'output' );

	const bgColor = 0xeeeeee;

	// renderer setup
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( bgColor, 1 );
	document.body.appendChild( renderer.domElement );

	// scene setup
	scene = new THREE.Scene();

	// lights
	const light = new THREE.DirectionalLight( 0xffffff, 2 );
	light.position.set( 1, 2, 3 );
	scene.add( light );
	scene.add( new THREE.AmbientLight( 0xb0bec5, 0.5 ) );

	// load model
	group = new THREE.Group();
	scene.add( group );

	window.addEventListener( 'resize', function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}, false );

	const gltf = await new GLTFLoader()
		.setMeshoptDecoder( MeshoptDecoder )
		.loadAsync( 'https://raw.githubusercontent.com/gkjohnson/3d-demo-data/main/models/nasa-m2020/Perseverance.glb' );
	model = gltf.scene;

	const whiteMaterial = new THREE.MeshStandardMaterial();
	whiteModel = model.clone();
	whiteModel.traverse( c => {

		if ( c.material ) {

			c.material = whiteMaterial;

		}

	} );

	group.updateMatrixWorld( true );

	// center model
	const box = new THREE.Box3();
	box.setFromObject( model, true );
	box.getCenter( group.position ).multiplyScalar( - 1 );
	group.position.y = Math.max( 0, - box.min.y ) + 1;
	group.add( model, whiteModel );

	// generate geometry line segments
	lines = new THREE.Group();
	model.traverse( c => {

		if ( c.geometry ) {

			const geomLines = new THREE.LineSegments( new THREE.EdgesGeometry( c.geometry, 50 ), new THREE.LineBasicMaterial( { color: 0x030303 } ) );
			geomLines.position.copy( c.position );
			geomLines.quaternion.copy( c.quaternion );
			geomLines.scale.copy( c.scale );
			lines.add( geomLines );

		}

	} );
	group.add( lines );

	// create projection display mesh
	projection = new THREE.LineSegments( new THREE.BufferGeometry(), new THREE.LineBasicMaterial( { color: 0x030303 } ) );
	scene.add( projection );

	// camera setup
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 100 );
	camera.position.setScalar( 3.5 );
	camera.updateProjectionMatrix();

	controls = new OrbitControls( camera, renderer.domElement );

	gui = new GUI();
	gui.add( params, 'displayModel', [ 'none', 'color', 'white' ] );
	gui.add( params, 'displayEdges' );
	gui.add( params, 'displayProjection' );
	gui.add( params, 'useBVH' );
	gui.add( params, 'sortEdges' );
	gui.add( params, 'rotate' );
	gui.add( params, 'regenerate' );

	task = updateEdges();

	render();

}

function* updateEdges( runTime = 30 ) {

	outputContainer.innerText = 'processing: --';
	scene.remove( projection );

	// transform and merge geometries to project into a single model
	let timeStart = window.performance.now();
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
	const mergeTime = window.performance.now() - timeStart;

	yield;

	// generate the bvh for acceleration
	timeStart = window.performance.now();
	const bvh = new MeshBVH( mergedGeometry );
	const bvhTime = window.performance.now() - timeStart;

	yield;

	// generate the candidate edges
	timeStart = window.performance.now();

	const generator = new ProjectionGenerator();
	generator.sortEdges = params.sortEdges;

	const task = generator.generate( bvh );
	let result;
	let taskTime = window.performance.now();
	while ( result = task.next() ) {

		if ( result.done ) {

			break;

		}

		if ( window.performance.now() - taskTime > runTime ) {

			yield;
			taskTime = window.performance.now();

		}

	}

	const geometry = result.value;
	const trimTime = window.performance.now() - timeStart;


	projection.geometry.dispose();
	projection.geometry = geometry;
	scene.add( projection );

	outputContainer.innerText =
		`merge geometry  : ${ mergeTime.toFixed( 2 ) }ms\n` +
		`bvh generation  : ${ bvhTime.toFixed( 2 ) }ms\n` +
		`edge trimming   : ${ trimTime.toFixed( 2 ) }ms\n\n`;

}


function render() {

	requestAnimationFrame( render );

	if ( task ) {

		const res = task.next();
		if ( res.done ) {

			task = null;

		}

	}

	model.visible = params.displayModel === 'color';
	whiteModel.visible = params.displayModel === 'white';
	lines.visible = params.displayEdges;
	projection.visible = params.displayProjection;

	renderer.render( scene, camera );

}
