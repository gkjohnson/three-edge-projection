import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ProjectionGenerator } from '..';
import { ProjectionGeneratorWorker } from '../src/worker/ProjectionGeneratorWorker.js';

const params = {
	displayModel: 'color',
	displayEdges: false,
	displayProjection: true,
	sortEdges: true,
	useWorker: false,
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
let worker;
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

	const ambientLight = new THREE.AmbientLight( 0xb0bec5, 0.5 );
	scene.add( ambientLight );

	// load model
	group = new THREE.Group();
	scene.add( group );

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

	// controls
	controls = new OrbitControls( camera, renderer.domElement );

	gui = new GUI();
	gui.add( params, 'displayModel', [ 'none', 'color', 'white' ] );
	gui.add( params, 'displayEdges' );
	gui.add( params, 'displayProjection' );
	gui.add( params, 'sortEdges' );
	gui.add( params, 'useWorker' );
	gui.add( params, 'rotate' );
	gui.add( params, 'regenerate' );

	worker = new ProjectionGeneratorWorker();

	task = updateEdges();

	render();

	window.addEventListener( 'resize', function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}, false );

}

function* updateEdges( runTime = 10 ) {

	outputContainer.innerText = 'processing: --';

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

	// generate the candidate edges
	timeStart = window.performance.now();

	let geometry = null;
	if ( ! params.useWorker ) {

		const generator = new ProjectionGenerator();
		generator.sortEdges = params.sortEdges;
		generator.iterationTime = runTime;

		const task = generator.generate( mergedGeometry, {

			onProgress: ( p, data ) => {

				outputContainer.innerText = `processing: ${ parseFloat( ( p * 100 ).toFixed( 2 ) ) }%`;
				if ( params.displayProjection ) {

					projection.geometry.dispose();
					projection.geometry = data.getLineGeometry();

				}


			},

		} );

		let result = task.next();
		while ( ! result.done ) {

			result = task.next();
			yield;

		}

		geometry = result.value;

	} else {

		worker
			.generate( mergedGeometry, {
				sortEdges: params.sortEdges,
				onProgress: p => {

					outputContainer.innerText = `processing: ${ parseFloat( ( p * 100 ).toFixed( 2 ) ) }%`;

				},
			} )
			.then( result => {

				geometry = result;

			} );

		while ( geometry === null ) {

			yield;

		}

	}

	const trimTime = window.performance.now() - timeStart;

	projection.geometry.dispose();
	projection.geometry = geometry;
	outputContainer.innerText =
		`merge geometry  : ${ mergeTime.toFixed( 2 ) }ms\n` +
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
