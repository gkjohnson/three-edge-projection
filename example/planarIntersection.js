import {
	Box3,
	WebGLRenderer,
	Scene,
	DirectionalLight,
	AmbientLight,
	Group,
	MeshBasicMaterial,
	BufferGeometry,
	LineSegments,
	LineBasicMaterial,
	PerspectiveCamera,
	Mesh,
	PlaneGeometry,
	DoubleSide,
} from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { PlanarIntersectionGenerator } from '..';
import { MeshBVH } from 'three-mesh-bvh';

const params = {
	displayModel: true,
	planePosition: 1,
};

let renderer, camera, scene, gui, controls, bvh;
let model, projection, group, plane;
let outputContainer;

init();

async function init() {

	outputContainer = document.getElementById( 'output' );

	const bgColor = 0x111111;

	// renderer setup
	renderer = new WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( bgColor, 1 );
	renderer.clear();
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
	model = gltf.scene;

	// generate the merged geometry
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
	bvh = new MeshBVH( mergedGeometry, { maxLeafTris: 1 } );

	// center model
	const box = new Box3();
	box.setFromObject( model, true );
	box.getCenter( group.position ).multiplyScalar( - 1 );
	group.position.y = Math.max( 0, - box.min.y ) + 1;
	group.add( model );

	// create plane to display the cut location
	plane = new Mesh( new PlaneGeometry( 5, 5 ), new MeshBasicMaterial( { color: 0x333333, transparent: true, opacity: 0.5, side: DoubleSide } ) );
	plane.rotation.x = - Math.PI / 2;
	group.add( plane );

	// create projection display mesh
	projection = new LineSegments( new BufferGeometry(), new LineBasicMaterial( { color: 0xeeeeee } ) );
	projection.scale.y = 0;
	scene.add( projection );

	// camera setup
	camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 50 );
	camera.position.setScalar( 3.5 );
	camera.updateProjectionMatrix();

	// controls
	controls = new OrbitControls( camera, renderer.domElement );

	updateLines();

	gui = new GUI();
	gui.add( params, 'displayModel' );
	gui.add( params, 'planePosition', 0, 2.5 ).onChange( () => updateLines() );
	render();

	window.addEventListener( 'resize', function () {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}, false );

}

function updateLines() {

	projection.geometry.dispose();

	const generator = new PlanarIntersectionGenerator();
	generator.plane.constant = - params.planePosition;

	let start, delta;
	start = performance.now();
	projection.geometry = generator.generate( bvh );
	delta = performance.now() - start;

	outputContainer.innerText = `${ delta.toFixed( 2 ) }ms`;

}

function render() {

	requestAnimationFrame( render );

	group.visible = params.displayModel;
	projection.visible = params.displayProjection;
	plane.position.y = params.planePosition;
	renderer.render( scene, camera );

}
