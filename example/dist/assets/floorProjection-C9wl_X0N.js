import { O as OrbitControls, m as MOUSE, T as TOUCH, V as Vector3, n as Plane, o as Vector2, p as Raycaster, W as WebGLRenderer, h as Scene, D as DirectionalLight, A as AmbientLight, G as Group, k as Box3, e as Mesh, B as BufferGeometry, q as MeshBasicMaterial, r as DoubleSide, d as LineSegments, a as LineBasicMaterial, P as PerspectiveCamera, l as g, s as mergeGeometries } from "./PlanarIntersectionGenerator-ChmpyYEB.js";
import { G as GLTFLoader, M as MeshoptDecoder } from "./meshopt_decoder.module-CoStjsgL.js";
import { P as ProjectionGenerator } from "./ProjectionGenerator-DFBBZv3o.js";
import { S as SilhouetteGenerator } from "./SilhouetteGenerator-BthsVxbf.js";
const _plane = new Plane();
const _raycaster = new Raycaster();
const _mouse = new Vector2();
const _panCurrent = new Vector3();
class MapControls extends OrbitControls {
  constructor(object, domElement) {
    super(object, domElement);
    this.screenSpacePanning = false;
    this.mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE };
    this.touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE };
    this._panWorldStart = new Vector3();
  }
  _handleMouseDownPan(event) {
    super._handleMouseDownPan(event);
    this._panOffset.set(0, 0, 0);
    if (this.screenSpacePanning === true) return;
    _plane.setFromNormalAndCoplanarPoint(this.object.up, this.target);
    const element = this.domElement;
    const rect = element.getBoundingClientRect();
    _mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_mouse, this.object);
    _raycaster.ray.intersectPlane(_plane, this._panWorldStart);
  }
  _handleMouseMovePan(event) {
    if (this.screenSpacePanning === true) {
      super._handleMouseMovePan(event);
      return;
    }
    const element = this.domElement;
    const rect = element.getBoundingClientRect();
    _mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_mouse, this.object);
    if (_raycaster.ray.intersectPlane(_plane, _panCurrent)) {
      _panCurrent.sub(this._panWorldStart);
      this._panOffset.copy(_panCurrent).negate();
      this.update();
    }
  }
}
const ANGLE_THRESHOLD = 50;
let renderer, camera, scene, gui, controls;
let model, outlines, group, silhouette;
let outputContainer;
let task = null;
const params = {
  displayModel: false,
  regenerate: () => {
    task = updateProjection();
  }
};
init();
async function init() {
  outputContainer = document.getElementById("output");
  const bgColor = 1118481;
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(bgColor, 1);
  document.body.appendChild(renderer.domElement);
  scene = new Scene();
  const light = new DirectionalLight(16777215, 3.5);
  light.position.set(1, 2, 3);
  scene.add(light);
  const ambientLight = new AmbientLight(11583173, 0.5);
  scene.add(ambientLight);
  group = new Group();
  scene.add(group);
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync("https://raw.githubusercontent.com/gkjohnson/3d-demo-data/main/models/3d-home-layout/scene.glb");
  model = gltf.scene;
  group.updateMatrixWorld(true);
  const box = new Box3();
  box.setFromObject(model, true);
  box.getCenter(group.position).multiplyScalar(-1);
  group.position.y = Math.max(0, -box.min.y) + 1;
  group.add(model);
  model.visible = false;
  silhouette = new Mesh(new BufferGeometry(), new MeshBasicMaterial({
    color: "#eee",
    polygonOffset: true,
    polygonOffsetFactor: 3,
    polygonOffsetUnits: 3,
    side: DoubleSide
  }));
  outlines = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ color: 197379 }));
  scene.add(outlines, silhouette);
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 50);
  camera.position.setScalar(5.5);
  camera.updateProjectionMatrix();
  controls = new MapControls(camera, renderer.domElement);
  controls.zoomToCursor = true;
  controls.maxPolarAngle = Math.PI / 3;
  task = updateProjection();
  gui = new g();
  gui.add(params, "displayModel");
  gui.add(params, "regenerate");
  render();
  window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);
}
function* updateProjection() {
  outputContainer.innerText = "processing: --";
  silhouette.visible = false;
  outlines.visible = false;
  const geometries = [];
  model.updateWorldMatrix(true, true);
  model.traverse((c) => {
    if (c.geometry) {
      const clone = c.geometry.clone();
      clone.applyMatrix4(c.matrixWorld);
      for (const key in clone.attributes) {
        if (key !== "position") {
          clone.deleteAttribute(key);
        }
      }
      geometries.push(clone);
    }
  });
  const mergedGeometry = mergeGeometries(geometries, false);
  yield;
  let task2, result, generator;
  generator = new SilhouetteGenerator();
  generator.sortTriangles = true;
  task2 = generator.generate(mergedGeometry, {
    onProgress: (p, data) => {
      outputContainer.innerText = `processing: ${parseFloat((p * 100).toFixed(2))}%`;
      silhouette.geometry.dispose();
      silhouette.geometry = data.getGeometry();
      silhouette.visible = true;
    }
  });
  result = task2.next();
  while (!result.done) {
    result = task2.next();
    yield;
  }
  silhouette.geometry.dispose();
  silhouette.geometry = result.value;
  silhouette.visible = true;
  outputContainer.innerText = "generating intersection edges...";
  generator = new ProjectionGenerator();
  generator.angleThreshold = ANGLE_THRESHOLD;
  task2 = generator.generate(mergedGeometry, {
    onProgress: (p, data) => {
      outputContainer.innerText = `processing: ${parseFloat((p * 100).toFixed(2))}%`;
      outlines.geometry.dispose();
      outlines.geometry = data.getVisibleLineGeometry();
      outlines.visible = true;
    }
  });
  result = task2.next();
  while (!result.done) {
    result = task2.next();
    yield;
  }
  outlines.geometry.dispose();
  outlines.geometry = result.value;
  outlines.visible = true;
  outputContainer.innerText = "";
}
function render() {
  requestAnimationFrame(render);
  if (task) {
    const res = task.next();
    if (res.done) {
      task = null;
    }
  }
  model.visible = params.displayModel;
  renderer.render(scene, camera);
}
//# sourceMappingURL=floorProjection-C9wl_X0N.js.map
