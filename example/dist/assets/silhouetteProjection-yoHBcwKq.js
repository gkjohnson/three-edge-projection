import { B as BufferGeometry, c as BufferAttribute, W as WebGLRenderer, h as Scene, D as DirectionalLight, A as AmbientLight, G as Group, e as Mesh, aB as TorusKnotGeometry, M as MeshStandardMaterial, q as MeshBasicMaterial, r as DoubleSide, d as LineSegments, a as LineBasicMaterial, P as PerspectiveCamera, O as OrbitControls, l as g, s as mergeGeometries, k as Box3 } from "./PlanarIntersectionGenerator-ChmpyYEB.js";
import { O as OUTPUT_BOTH, S as SilhouetteGenerator } from "./SilhouetteGenerator-BthsVxbf.js";
const NAME = "SilhouetteGeneratorWorker";
class SilhouetteGeneratorWorker {
  constructor() {
    this.running = false;
    this.worker = new Worker(new URL(
      /* @vite-ignore */
      "" + new URL("silhouetteAsync.worker-Sr2D9vbb.js", import.meta.url).href,
      import.meta.url
    ), { type: "module" });
    this.worker.onerror = (e) => {
      if (e.message) {
        throw new Error(`${NAME}: Could not create Web Worker with error "${e.message}"`);
      } else {
        throw new Error(`${NAME}: Could not create Web Worker.`);
      }
    };
  }
  generate(geometry, options = {}) {
    if (this.running) {
      throw new Error(`${NAME}: Already running job.`);
    }
    if (this.worker === null) {
      throw new Error(`${NAME}: Worker has been disposed.`);
    }
    const { worker: worker2 } = this;
    this.running = true;
    return new Promise((resolve, reject) => {
      worker2.onerror = (e) => {
        reject(new Error(`${NAME}: ${e.message}`));
        this.running = false;
      };
      worker2.onmessage = (e) => {
        this.running = false;
        const { data } = e;
        if (data.error) {
          reject(new Error(data.error));
          worker2.onmessage = null;
        } else if (data.result) {
          if (options.output === OUTPUT_BOTH) {
            const result = data.result.map((info) => {
              const geometry2 = new BufferGeometry();
              geometry2.setAttribute("position", new BufferAttribute(info.position, 3, false));
              if (info.index) {
                geometry2.setIndex(new BufferAttribute(info.index, 1, false));
              }
              return geometry2;
            });
            resolve(result);
          } else {
            const geometry2 = new BufferGeometry();
            geometry2.setAttribute("position", new BufferAttribute(data.result.position, 3, false));
            geometry2.setIndex(new BufferAttribute(data.result.index, 1, false));
            resolve(geometry2);
          }
          worker2.onmessage = null;
        } else if (options.onProgress) {
          options.onProgress(data.progress);
        }
      };
      const index = geometry.index ? geometry.index.array.slice() : null;
      const position = geometry.attributes.position.array.slice();
      const transfer = [position.buffer];
      if (index) {
        transfer.push(index.buffer);
      }
      worker2.postMessage({
        index,
        position,
        options: {
          ...options,
          onProgress: null,
          includedProgressCallback: Boolean(options.onProgress)
        }
      }, transfer);
    });
  }
  dispose() {
    this.worker.terminate();
    this.worker = null;
  }
}
const params = {
  displaySilhouette: true,
  displayWireframe: false,
  displayOutline: false,
  displayModel: true,
  useWorker: false,
  rotate: () => {
    group.quaternion.random();
    group.position.set(0, 0, 0);
    group.updateMatrixWorld(true);
    const box = new Box3();
    box.setFromObject(model, true);
    box.getCenter(group.position).multiplyScalar(-1);
    group.position.y = Math.max(0, -box.min.y) + 1;
  },
  regenerate: () => {
    task = updateEdges();
  }
};
let renderer, camera, scene, gui;
let model, projection, projectionWireframe, group, edges;
let outputContainer;
let worker;
let task = null;
init();
async function init() {
  outputContainer = document.getElementById("output");
  const bgColor = 15658734;
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
  group.position.y = 2;
  scene.add(group);
  model = new Mesh(new TorusKnotGeometry(1, 0.4, 120, 30), new MeshStandardMaterial({
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  }));
  model.rotation.set(Math.PI / 4, 0, Math.PI / 8);
  group.add(model);
  projection = new Mesh(void 0, new MeshBasicMaterial({
    color: 15753874,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  }));
  projection.position.y = -2;
  scene.add(projection);
  edges = new LineSegments(void 0, new LineBasicMaterial({ color: 0 }));
  edges.position.y = -2;
  scene.add(edges);
  projectionWireframe = new Mesh(void 0, new MeshBasicMaterial({ color: 12720219, wireframe: true }));
  projectionWireframe.position.y = -2;
  scene.add(projectionWireframe);
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 50);
  camera.position.setScalar(4.5);
  camera.updateProjectionMatrix();
  new OrbitControls(camera, renderer.domElement);
  gui = new g();
  gui.add(params, "displayModel");
  gui.add(params, "displaySilhouette");
  gui.add(params, "displayOutline");
  gui.add(params, "displayWireframe");
  gui.add(params, "useWorker");
  gui.add(params, "rotate");
  gui.add(params, "regenerate");
  worker = new SilhouetteGeneratorWorker();
  task = updateEdges();
  render();
  window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);
}
function* updateEdges(runTime = 30) {
  outputContainer.innerText = "processing: --";
  let timeStart = window.performance.now();
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
  const mergeTime = window.performance.now() - timeStart;
  yield;
  timeStart = window.performance.now();
  let result = null;
  if (!params.useWorker) {
    const generator = new SilhouetteGenerator();
    generator.iterationTime = runTime;
    generator.output = OUTPUT_BOTH;
    const task2 = generator.generate(mergedGeometry, {
      onProgress: (p, info) => {
        outputContainer.innerText = `processing: ${parseFloat((p * 100).toFixed(2))}%`;
        const result2 = info.getGeometry();
        projection.geometry.dispose();
        projection.geometry = result2[0];
        projectionWireframe.geometry = result2[0];
        edges.geometry.dispose();
        edges.geometry = result2[1];
        if (params.displaySilhouette || params.displayWireframe || params.displayOutline) {
          projection.geometry.dispose();
          projection.geometry = result2[0];
          projectionWireframe.geometry = result2[0];
          edges.geometry.dispose();
          edges.geometry = result2[1];
        }
      }
    });
    let res = task2.next();
    while (!res.done) {
      res = task2.next();
      yield;
    }
    result = res.value;
  } else {
    worker.generate(mergedGeometry, {
      output: OUTPUT_BOTH,
      onProgress: (p) => {
        outputContainer.innerText = `processing: ${parseFloat((p * 100).toFixed(2))}%`;
      }
    }).then((res) => {
      result = res;
    });
    while (result === null) {
      yield;
    }
  }
  const trimTime = window.performance.now() - timeStart;
  projection.geometry.dispose();
  projection.geometry = result[0];
  projectionWireframe.geometry = result[0];
  edges.geometry.dispose();
  edges.geometry = result[1];
  outputContainer.innerText = `merge geometry  : ${mergeTime.toFixed(2)}ms
edge trimming   : ${trimTime.toFixed(2)}ms
triangles       : ${projection.geometry.index.count / 3} tris`;
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
  projection.visible = params.displaySilhouette;
  projectionWireframe.visible = params.displayWireframe;
  edges.visible = params.displayOutline;
  renderer.render(scene, camera);
}
//# sourceMappingURL=silhouetteProjection-yoHBcwKq.js.map
