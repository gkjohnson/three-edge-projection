import { a6 as Scene, a7 as DirectionalLight, a8 as AmbientLight, G as Group, B as Box3, ae as LineSegments, n as BufferGeometry, Y as LineBasicMaterial, i as PerspectiveCamera, af as g, C as Color, o as BufferAttribute } from "./bvhcastEdges-BzgT52m-.js";
import { W as WebGPURenderer, P as ProjectionGenerator, M as MeshVisibilityCuller } from "./MeshVisibilityCuller-W_xg_ywn.js";
import { O as OrbitControls } from "./BufferGeometryUtils-jm7XNhLg.js";
import { G as GLTFLoader, M as MeshoptDecoder } from "./meshopt_decoder.module-oo7avBJW.js";
import "./ProjectionGenerator-M7W92PRG.js";
const params = {
  displayModel: true,
  displayDrawThroughProjection: false,
  includeIntersectionEdges: false,
  visibilityCullMeshes: false,
  perObjectColors: false,
  regenerate: () => {
    updateEdges();
  },
  rotate: () => {
    group.quaternion.random();
    group.position.set(0, 0, 0);
    group.updateMatrixWorld(true);
    const box = new Box3();
    box.setFromObject(model, true);
    box.getCenter(group.position).multiplyScalar(-1);
    group.position.y = Math.max(0, -box.min.y) + 1;
    group.updateMatrixWorld(true);
    needsRender = true;
  }
};
let needsRender = false;
let renderer, camera, scene, gui, controls;
let model, projection, drawThroughProjection, group;
let outputContainer;
let abortController;
init();
async function init() {
  outputContainer = document.getElementById("output");
  const bgColor = 15658734;
  renderer = new WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(bgColor, 1);
  await renderer.init();
  document.body.appendChild(renderer.domElement);
  scene = new Scene();
  const light = new DirectionalLight(16777215, 3.5);
  light.position.set(1, 2, 3);
  scene.add(light);
  const ambientLight = new AmbientLight(11583173, 0.5);
  scene.add(ambientLight);
  group = new Group();
  scene.add(group);
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync("https://raw.githubusercontent.com/gkjohnson/3d-demo-data/main/models/nasa-m2020/Perseverance.glb");
  model = gltf.scene;
  const box = new Box3();
  box.setFromObject(model, true);
  box.getCenter(group.position).multiplyScalar(-1);
  group.position.y = Math.max(0, -box.min.y) + 1;
  group.add(model);
  group.updateMatrixWorld(true);
  projection = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ depthWrite: false }));
  drawThroughProjection = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ depthWrite: false }));
  drawThroughProjection.renderOrder = -1;
  scene.add(projection, drawThroughProjection);
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1e6);
  camera.position.setScalar(3.5);
  camera.updateProjectionMatrix();
  needsRender = true;
  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", () => {
    needsRender = true;
  });
  gui = new g();
  const displayFolder = gui.addFolder("Display");
  displayFolder.add(params, "displayModel").onChange(() => needsRender = true);
  displayFolder.add(params, "displayDrawThroughProjection").onChange(() => needsRender = true);
  const projectionFolder = gui.addFolder("Projection");
  projectionFolder.add(params, "includeIntersectionEdges");
  projectionFolder.add(params, "visibilityCullMeshes");
  projectionFolder.add(params, "perObjectColors");
  projectionFolder.add(params, "rotate");
  projectionFolder.add(params, "regenerate");
  render();
  updateEdges();
  window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    needsRender = true;
  }, false);
}
async function updateEdges() {
  if (abortController) {
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
  const generator = new ProjectionGenerator(renderer);
  generator.includeIntersectionEdges = params.includeIntersectionEdges;
  model.visible = true;
  let input = [model];
  if (params.visibilityCullMeshes) {
    input = await new MeshVisibilityCuller(renderer, { pixelsPerMeter: 0.1 }).cull(input);
  }
  let result;
  try {
    result = await generator.generate(input, {
      signal: abortController.signal,
      onProgress: (p, msg) => {
        outputContainer.innerText = `${msg}... ${(p * 100).toFixed(2)}%`;
      }
    });
  } catch {
    return;
  }
  const visGeom = result.visibleEdges.getLineGeometry();
  const hidGeom = result.hiddenEdges.getLineGeometry();
  if (params.perObjectColors) {
    applyPerObjectColors(result.visibleEdges, visGeom);
    applyPerObjectColors(result.hiddenEdges, hidGeom, 0.8);
  }
  projection.geometry.dispose();
  projection.material.dispose();
  projection.geometry = visGeom;
  projection.material.vertexColors = params.perObjectColors;
  projection.material.color.set(params.perObjectColors ? 16777215 : 197379);
  drawThroughProjection.geometry.dispose();
  drawThroughProjection.material.dispose();
  drawThroughProjection.geometry = hidGeom;
  drawThroughProjection.material.vertexColors = params.perObjectColors;
  drawThroughProjection.material.color.set(params.perObjectColors ? 16777215 : 13290186);
  const elapsed = window.performance.now() - timeStart;
  outputContainer.innerText = `Generation time: ${elapsed.toFixed(2)}ms`;
  needsRender = true;
}
function applyPerObjectColors(edgeSet, geometry, lightness = 0.5) {
  const totalVertices = geometry.attributes.position.count;
  const colorArray = new Float32Array(totalVertices * 3);
  const color = new Color();
  for (const mesh of edgeSet.meshToSegments.keys()) {
    const range = edgeSet.getRangeForMesh(mesh);
    if (!range) continue;
    color.setHSL(Math.random(), 0.75, lightness);
    for (let i = range.start; i < range.start + range.count; i++) {
      colorArray[i * 3 + 0] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    }
  }
  geometry.setAttribute("color", new BufferAttribute(colorArray, 3));
}
function render() {
  requestAnimationFrame(render);
  model.visible = params.displayModel;
  drawThroughProjection.visible = params.displayDrawThroughProjection;
  if (needsRender) {
    renderer.render(scene, camera);
    needsRender = false;
  }
}
//# sourceMappingURL=edgeProjectionWebGPU-D4Em65aY.js.map
