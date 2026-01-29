import * as OBC from '@thatopen/components';
import * as THREE from 'three';
import { ProjectionGenerator, VisibilityCuller } from '..';


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
	world.scene.three.add(model.object);
	const now = performance.now();
	await fragments.core.update(true);
	const then = performance.now();
	console.log(`Time taken: ${then - now}ms`);

	return model;
}

const model = await loadModel("/school_arq.frag");

const clipper = components.get(OBC.Clipper);
clipper.createFromNormalAndCoplanarPoint(world, new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0));

const furnishingElementIds = await model.getItemsOfCategories([
	/IFCFURNISHINGELEMENT/,
]);
console.log(
	"IFCFURNISHINGELEMENT ids:",
	Object.values(furnishingElementIds).flat(),
);


// const meshes = new Map();
// const allMeshes = [];
// const material = new THREE.MeshBasicMaterial({
// 	color: new THREE.Color(1, 0, 0),
// 	opacity: 0.6,
// 	transparent: true,
// 	depthTest: false,
// 	polygonOffset: true,
// 	polygonOffsetUnits: 1,
// 	polygonOffsetFactor: 0.1,
// });

// // Add picking meshes (deduplicating geometries to save memory)
// // const idsWithGeometry = await model.getItemsIdsWithGeometry();
// const allMeshesData = await model.getItemsGeometry(furnishingElementIds);

// const geometries = new Map();

// for (const itemId in allMeshesData) {
// 	const meshData = allMeshesData[itemId];
// 	const itemMeshes = [];
// 	const itemIdInt = parseInt(itemId, 10);
// 	meshes.set(itemIdInt, itemMeshes);
// 	for (const geomData of meshData) {
// 		if (
// 			!geomData.positions ||
// 			!geomData.indices ||
// 			!geomData.transform ||
// 			!geomData.representationId
// 		) {
// 			continue;
// 		}

// 		const representationId = geomData.representationId;
// 		if (!geometries.has(representationId)) {
// 			const geometry = new THREE.BufferGeometry();
// 			geometry.setAttribute(
// 				"position",
// 				new THREE.Float32BufferAttribute(geomData.positions, 3),
// 			);
// 			geometry.setIndex(Array.from(geomData.indices));
// 			geometries.set(representationId, geometry);
// 		}

// 		const geometry = geometries.get(representationId);

// 		const mesh = new THREE.Mesh(geometry, material);
// 		mesh.userData.itemId = itemIdInt;
// 		mesh.applyMatrix4(geomData.transform);
// 		mesh.updateWorldMatrix(true, true);
// 		itemMeshes.push(mesh);
// 		allMeshes.push(mesh);
// 	}
// }


const generator = new ProjectionGenerator();
const result = await generator.generateAsync(geometry, {
	visibilityCuller: new VisibilityCuller(renderer, { pixelsPerMeter: 0.1 }),
});
const mesh = new Mesh(result.getVisibleLineGeometry(), material);
scene.add(mesh);
