import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { MeshBVH, SAH } from 'three-mesh-bvh';
import * as OBC from '@thatopen/components';
import { ProjectionGenerator, VisibilityCuller } from '..';


const params = {
	displayModel: true,
	displayDrawThroughProjection: false,
	includeIntersectionEdges: false,
	rotate: () => {

		group.quaternion.random();
		group.position.set(0, 0, 0);
		group.updateMatrixWorld(true);

		const box = new THREE.Box3();
		box.setFromObject(group, true);
		box.getCenter(group.position).multiplyScalar(- 1);
		group.position.y = Math.max(0, - box.min.y) + 1;
		group.updateMatrixWorld(true);

		task = updateEdges();

	},
	regenerate: () => {

		task = updateEdges();

	},
};

const ANGLE_THRESHOLD = 50;
// let needsRender = false;
let gui;
let group, projection, drawThroughProjection;
let outputContainer;
let task = null;


const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);
const container = document.getElementById("container");

const world = worlds.create();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBC.SimpleRenderer(components, container);
world.camera = new OBC.OrthoPerspectiveCamera(components);

components.init();

world.scene.setup();
// world.camera.three.far = 10000;

world.scene.three.add(new THREE.AxesHelper());

outputContainer = document.getElementById('output');


// load model



// prettier-ignore
const githubUrl =
	"https://thatopen.github.io/engine_fragment/resources/worker.mjs";
const fetchedUrl = await fetch(githubUrl);
const workerBlob = await fetchedUrl.blob();
const workerFile = new File([workerBlob], "worker.mjs", {
	type: "text/javascript",
});
const workerUrl = URL.createObjectURL(workerFile);
const fragments = components.get(OBC.FragmentsManager);
fragments.init(workerUrl);

world.camera.controls.addEventListener("control", () =>
	fragments.core.update(true),
);

// Remove z fighting
fragments.core.models.materials.list.onItemSet.add(({ value: material }) => {
	if (!("isLodMaterial" in material && material.isLodMaterial)) {
		material.polygonOffset = true;
		material.polygonOffsetUnits = 1;
		material.polygonOffsetFactor = Math.random();
	}
});

async function loadModel(
	url,
	id = url,
	raw = false,
	transform = new THREE.Vector3(),
) {
	const fetched = await fetch(url);
	const buffer = await fetched.arrayBuffer();

	const model = await fragments.core.load(buffer, {
		modelId: id,
		camera: world.camera.three,
		raw,
	});

	model.object.position.add(transform);
	// world.scene.three.add(model.object);
	const now = performance.now();
	await fragments.core.update(true);
	const then = performance.now();
	console.log(`Time taken: ${then - now}ms`);

	return model;
}

const model = await loadModel("/school_arq.frag");

// group = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
// group.position.y += 3;
// world.scene.three.add( group );
// group.rotation.set( Math.PI / 4, 0, Math.PI / 8 );

group = new THREE.Group();
world.scene.three.add(group);

const material = new THREE.MeshLambertMaterial({
	color: new THREE.Color("white"),
});

// Add picking meshes (deduplicating geometries to save memory)
const idsWithGeometry = await model.getItemsIdsWithGeometry();
const allMeshesData = await model.getItemsGeometry(idsWithGeometry);

const geometries = new Map();

for (const itemId in allMeshesData) {
	const meshData = allMeshesData[itemId];
	const itemIdInt = parseInt(itemId, 10);
	for (const geomData of meshData) {
		if (
			!geomData.positions ||
			!geomData.indices ||
			!geomData.transform ||
			!geomData.representationId
		) {
			continue;
		}

		const representationId = geomData.representationId;
		if (!geometries.has(representationId)) {
			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				"position",
				new THREE.Float32BufferAttribute(geomData.positions, 3),
			);
			geometry.setAttribute(
				"normal",
				new THREE.Float32BufferAttribute(geomData.normals, 3),
			);
			geometry.setIndex(Array.from(geomData.indices));
			geometries.set(representationId, geometry);
		}

		const geometry = geometries.get(representationId);

		const mesh = new THREE.Mesh(geometry, material);
		mesh.userData.itemId = itemIdInt;
		mesh.applyMatrix4(geomData.transform);
		mesh.updateWorldMatrix(true, true);
		group.add(mesh);
	}
}


// initialize BVHs
group.traverse(c => {

	if (c.geometry && !c.geometry.boundsTree) {

		const elCount = c.geometry.index ? c.geometry.index.count : c.geometry.attributes.position.count;
		c.geometry.groups.forEach(group => {

			if (group.count === Infinity) {

				group.count = elCount - group.start;

			}

		});

		c.geometry.boundsTree = new MeshBVH(c.geometry, { maxLeafSize: 1, strategy: SAH });

	}

});

// center model
const box = new THREE.Box3();
box.setFromObject(group, true);

// create projection display mesh
projection = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x030303, depthWrite: false, depthTest: false }));
drawThroughProjection = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xcacaca, depthWrite: false }));
drawThroughProjection.renderOrder = - 1;
world.scene.three.add(projection, drawThroughProjection);

gui = new GUI();
gui.add(params, 'includeIntersectionEdges');
gui.add(params, 'rotate');
gui.add(params, 'regenerate');

world.renderer.onBeforeUpdate.add(() => {

	if (task) {

		const res = task.next();
		if (res.done) {

			task = null;

		}

	}

	group.visible = params.displayModel;
	drawThroughProjection.visible = params.displayDrawThroughProjection;

});


function* updateEdges(runTime = 30) {

	outputContainer.innerText = 'Generating...';

	// dispose the geometry
	projection.geometry.dispose();
	drawThroughProjection.geometry.dispose();

	// initialize an empty geometry
	projection.geometry = new THREE.BufferGeometry();
	drawThroughProjection.geometry = new THREE.BufferGeometry();

	const timeStart = window.performance.now();
	const generator = new ProjectionGenerator();
	generator.iterationTime = runTime;
	generator.angleThreshold = ANGLE_THRESHOLD;
	generator.includeIntersectionEdges = params.includeIntersectionEdges;

	const collection = yield* generator.generate(group, {
		visibilityCuller: new VisibilityCuller(world.renderer.three, { pixelsPerMeter: 0.1 }),
		onProgress: (msg, tot, edges) => {

			outputContainer.innerText = msg;
			if (tot) outputContainer.innerText += ' ' + (100 * tot).toFixed(1) + '%';

			if (edges) {

				projection.geometry.dispose();
				projection.geometry = edges.getVisibleLineGeometry();

			}

		},
	});
	drawThroughProjection.geometry.dispose();
	drawThroughProjection.geometry = collection.getHiddenLineGeometry();

	projection.geometry.dispose();
	projection.geometry = collection.getVisibleLineGeometry();
	const geometry = projection.geometry;
	const trimTime = window.performance.now() - timeStart;

	projection.geometry.dispose();
	projection.geometry = geometry;
	outputContainer.innerText = `Generation time: ${trimTime.toFixed(2)}ms`;

}

// task = updateEdges();

