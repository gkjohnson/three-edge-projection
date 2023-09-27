import {
	Box3,
	WebGLRenderer,
	Scene,
	DirectionalLight,
	AmbientLight,
	Group,
	MeshStandardMaterial,
	MeshBasicMaterial,
	PerspectiveCamera,
	Mesh,
	TorusKnotGeometry,
	DoubleSide,
} from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SilhouetteGenerator } from '../src';
import { SilhouetteGeneratorWorker } from '../src/worker/SilhouetteGeneratorWorker.js';

const params = {
	displayModel: 'color',
	displaySilhouette: true,
	displayWireframe: false,
	displayOutline: false,
	useWorker: false,
	rotate: () => {

		group.quaternion.random();
		group.position.set( 0, 0, 0 );
		group.updateMatrixWorld( true );

		const box = new Box3();
		box.setFromObject( model, true );
		box.getCenter( group.position ).multiplyScalar( - 1 );
		group.position.y = Math.max( 0, - box.min.y ) + 1;

	},
	regenerate: () => {

		task = updateEdges();

	},
};

let renderer, camera, scene, gui, controls;
let model, projection, projectionWireframe, group, edges;
let outputContainer;
let worker;
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
	group.position.y = 2;
	scene.add( group );

	model = new Mesh( new TorusKnotGeometry( 1, 0.4, 120, 30 ), new MeshStandardMaterial( {
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	} ) );
	model.rotation.set( Math.PI / 4, 0, Math.PI / 8 );
	group.add( model );

	// create projection display mesh
	projection = new Mesh( undefined, new MeshBasicMaterial( {
		color: 0xf06292,
		side: DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	} ) );
	projection.position.y = - 2;
	scene.add( projection );

	edges = new LineSegments( undefined, new LineBasicMaterial( { color: 0 } ) );
	edges.position.y = - 2;
	scene.add( edges );

	projectionWireframe = new Mesh( undefined, new MeshBasicMaterial( { color: 0xc2185b, wireframe: true } ) );
	projectionWireframe.position.y = - 2;
	scene.add( projectionWireframe );

	// camera setup
	camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 50 );
	camera.position.setScalar( 4.5 );
	camera.updateProjectionMatrix();

	// controls
	controls = new OrbitControls( camera, renderer.domElement );

	gui = new GUI();
	gui.add( params, 'displaySilhouette' );
	gui.add( params, 'displayOutline' );
	gui.add( params, 'displayWireframe' );
	gui.add( params, 'useWorker' );
	gui.add( params, 'rotate' );
	gui.add( params, 'regenerate' );

	worker = new SilhouetteGeneratorWorker();

	task = updateEdges();

	render();

	window.addEventListener( 'resize', function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}, false );

}

function* updateEdges( runTime = 30 ) {

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

	let result = null;
	if ( ! params.useWorker ) {

		const generator = new SilhouetteGenerator();
		generator.iterationTime = runTime;
		generator.output = 2;
		const task = generator.generate( mergedGeometry, {

			onProgress: ( p, info ) => {

				outputContainer.innerText = `processing: ${ parseFloat( ( p * 100 ).toFixed( 2 ) ) }%`;

				const result = info.getGeometry();
				projection.geometry.dispose();
				projection.geometry = result[ 0 ];
				projectionWireframe.geometry = result[ 0 ];

				edges.geometry.dispose();
				edges.geometry = result[ 1 ];

				if ( params.displaySilhouette || params.displayWireframe || params.displayOutline ) {

					projection.geometry.dispose();
					projection.geometry = result[ 0 ];
					projectionWireframe.geometry = result[ 0 ];

					edges.geometry.dispose();
					edges.geometry = result[ 1 ];

				}

			},

		} );

		let result = task.next();
		while ( ! result.done ) {

			result = task.next();
			yield;

		}

		result = result.value;

	} else {

		worker
			.generate( mergedGeometry, {
				onProgress: p => {

					outputContainer.innerText = `processing: ${ parseFloat( ( p * 100 ).toFixed( 2 ) ) }%`;

				},
			} )
			.then( result => {

				result = result;

			} );

		while ( result === null ) {

			yield;

		}

	}

	const trimTime = window.performance.now() - timeStart;

	projection.geometry.dispose();
	projection.geometry = result[ 0 ];
	projectionWireframe.geometry = result[ 0 ];

	edges.geometry.dispose();
	edges.geometry = result[ 1 ];

	outputContainer.innerText =
		`merge geometry  : ${ mergeTime.toFixed( 2 ) }ms\n` +
		`edge trimming   : ${ trimTime.toFixed( 2 ) }ms\n` +
		`triangles       : ${ result.index.count / 3 } tris`;

}


function render() {

	requestAnimationFrame( render );

	if ( task ) {

		const res = task.next();
		if ( res.done ) {

			task = null;

		}

	}

	projection.visible = params.displaySilhouette;
	projectionWireframe.visible = params.displayWireframe;
	edges.visible = params.displayOutline;
	renderer.render( scene, camera );

}
