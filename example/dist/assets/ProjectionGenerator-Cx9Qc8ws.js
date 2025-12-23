import { q as Line3, V as Vector3, r as Triangle, s as MathUtils, t as isLineTriangleEdge, b as Matrix4, i as MeshBVH, B as BufferGeometry, c as BufferAttribute, e as Mesh, u as isYProjectedLineDegenerate, j as SAH, v as bvhcastEdges } from "./PlanarIntersectionGenerator-2wKNn7t7.js";
const _line$1 = /* @__PURE__ */ new Line3();
function overlapsToLines(line, overlaps, invert = false, target = []) {
  let invOverlaps = [[0, 1]];
  for (let i = 0, l = overlaps.length; i < l; i++) {
    const invOverlap = invOverlaps[i];
    const overlap = overlaps[i];
    invOverlap[1] = overlap[0];
    invOverlaps.push([overlap[1], 1]);
  }
  if (invert) {
    [overlaps, invOverlaps] = [invOverlaps, overlaps];
  }
  for (let i = 0, l = invOverlaps.length; i < l; i++) {
    const { start, end } = line;
    _line$1.start.lerpVectors(start, end, invOverlaps[i][0]);
    _line$1.end.lerpVectors(start, end, invOverlaps[i][1]);
    target.push(new Float32Array([
      _line$1.start.x,
      _line$1.start.y,
      _line$1.start.z,
      _line$1.end.x,
      _line$1.end.y,
      _line$1.end.z
    ]));
  }
  return target;
}
const EPSILON = 1e-10;
const UP_VECTOR$1 = /* @__PURE__ */ new Vector3(0, 1, 0);
const _v0 = /* @__PURE__ */ new Vector3();
const _v1 = /* @__PURE__ */ new Vector3();
const _normal = /* @__PURE__ */ new Vector3();
const _triangle = /* @__PURE__ */ new Triangle();
function* generateEdges(geometry, target = [], options = {}) {
  const {
    projectionDirection = UP_VECTOR$1,
    thresholdAngle = 1,
    iterationTime = 30
  } = options;
  const precisionPoints = 4;
  const precision = Math.pow(10, precisionPoints);
  const thresholdDot = Math.cos(MathUtils.DEG2RAD * thresholdAngle);
  const indexAttr = geometry.getIndex();
  const positionAttr = geometry.getAttribute("position");
  const indexCount = indexAttr ? indexAttr.count : positionAttr.count;
  const indexArr = [0, 0, 0];
  const vertKeys = ["a", "b", "c"];
  const hashes = new Array(3);
  const edgeData = {};
  let time = performance.now();
  for (let i = 0; i < indexCount; i += 3) {
    if (performance.now() - time > iterationTime) {
      yield;
      time = performance.now();
    }
    if (indexAttr) {
      indexArr[0] = indexAttr.getX(i);
      indexArr[1] = indexAttr.getX(i + 1);
      indexArr[2] = indexAttr.getX(i + 2);
    } else {
      indexArr[0] = i;
      indexArr[1] = i + 1;
      indexArr[2] = i + 2;
    }
    const { a, b, c } = _triangle;
    a.fromBufferAttribute(positionAttr, indexArr[0]);
    b.fromBufferAttribute(positionAttr, indexArr[1]);
    c.fromBufferAttribute(positionAttr, indexArr[2]);
    _triangle.getNormal(_normal);
    hashes[0] = `${Math.round(a.x * precision)},${Math.round(a.y * precision)},${Math.round(a.z * precision)}`;
    hashes[1] = `${Math.round(b.x * precision)},${Math.round(b.y * precision)},${Math.round(b.z * precision)}`;
    hashes[2] = `${Math.round(c.x * precision)},${Math.round(c.y * precision)},${Math.round(c.z * precision)}`;
    if (hashes[0] === hashes[1] || hashes[1] === hashes[2] || hashes[2] === hashes[0]) {
      continue;
    }
    for (let j = 0; j < 3; j++) {
      const jNext = (j + 1) % 3;
      const vecHash0 = hashes[j];
      const vecHash1 = hashes[jNext];
      const v0 = _triangle[vertKeys[j]];
      const v1 = _triangle[vertKeys[jNext]];
      const hash = `${vecHash0}_${vecHash1}`;
      const reverseHash = `${vecHash1}_${vecHash0}`;
      if (reverseHash in edgeData && edgeData[reverseHash]) {
        const otherNormal = edgeData[reverseHash].normal;
        const meetsThreshold = _normal.dot(otherNormal) <= thresholdDot;
        let projectionThreshold = false;
        if (projectionDirection !== null) {
          let normDot = projectionDirection.dot(_normal);
          normDot = Math.abs(normDot) < EPSILON ? 0 : normDot;
          let otherDot = projectionDirection.dot(otherNormal);
          otherDot = Math.abs(otherDot) < EPSILON ? 0 : otherDot;
          projectionThreshold = Math.sign(normDot) !== Math.sign(otherDot);
        }
        if (meetsThreshold || projectionThreshold) {
          const line = new Line3();
          line.start.copy(v0);
          line.end.copy(v1);
          target.push(line);
        }
        edgeData[reverseHash] = null;
      } else if (!(hash in edgeData)) {
        edgeData[hash] = {
          index0: indexArr[j],
          index1: indexArr[jNext],
          normal: _normal.clone()
        };
      }
    }
  }
  for (const key in edgeData) {
    if (edgeData[key]) {
      const { index0, index1 } = edgeData[key];
      _v0.fromBufferAttribute(positionAttr, index0);
      _v1.fromBufferAttribute(positionAttr, index1);
      const line = new Line3();
      line.start.copy(_v0);
      line.end.copy(_v1);
      target.push(line);
    }
  }
  return target;
}
const _line = /* @__PURE__ */ new Line3();
function generateIntersectionEdges(bvhA, bvhB, matrixBToA, target = []) {
  bvhA.bvhcast(bvhB, matrixBToA, {
    intersectsTriangles: (tri1, tri2) => {
      if (areTrianglesOnEdge(tri1, tri2)) {
        return false;
      }
      if (tri1.needsUpdate) {
        tri1.update();
      }
      if (tri2.needsUpdate) {
        tri2.update();
      }
      if (Math.abs(tri1.plane.normal.dot(tri2.plane.normal)) > 1 - 1e-6) {
        return false;
      }
      if (tri1.intersectsTriangle(tri2, _line, true) && !isLineTriangleEdge(tri1, _line) && !isLineTriangleEdge(tri2, _line)) {
        target.push(_line.clone());
      }
    }
  });
  return target;
}
function areVectorsEqual(a, b) {
  return a.distanceTo(b) < 1e-10;
}
function areTrianglesOnEdge(t1, t2) {
  const indices = ["a", "b", "c"];
  let tot = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const v0 = t1[indices[i]];
      const v1 = t2[indices[j]];
      if (areVectorsEqual(v0, v1)) {
        tot++;
      }
    }
  }
  return tot >= 2;
}
function getAllMeshes(scene) {
  let meshes = [];
  scene.traverse((c) => {
    if (c.geometry && c.visible) {
      meshes.push(c);
    }
  });
  return meshes;
}
const _BtoA = /* @__PURE__ */ new Matrix4();
const _toLocalMatrix = /* @__PURE__ */ new Matrix4();
class EdgeGenerator {
  constructor() {
    this.projectionDirection = new Vector3(0, 1, 0);
    this.thresholdAngle = 50;
    this.iterationTime = 30;
  }
  // Functions for generating the "hard" and silhouette edges of the geometry along the projection direction
  getEdges(...args) {
    const currIterationTime = this.iterationTime;
    this.iterationTime = Infinity;
    const result = this.getEdgesGenerator(...args).next().value;
    this.iterationTime = currIterationTime;
    return result;
  }
  *getEdgesGenerator(geometry, resultEdges = []) {
    const { projectionDirection, thresholdAngle, iterationTime } = this;
    if (geometry.isObject3D) {
      const meshes = getAllMeshes(geometry);
      let localProjection = null;
      if (projectionDirection) {
        localProjection = new Vector3();
      }
      let time = performance.now();
      for (let i = 0; i < meshes.length; i++) {
        if (time - performance.now() > iterationTime) {
          yield;
        }
        const mesh = meshes[i];
        if (localProjection) {
          _toLocalMatrix.copy(mesh.matrixWorld).invert();
          localProjection.copy(projectionDirection).transformDirection(_toLocalMatrix).normalize();
        }
        const results = yield* generateEdges(mesh.geometry, [], {
          projectionDirection: localProjection,
          thresholdAngle,
          iterationTime
        });
        transformEdges(results, mesh.matrixWorld);
        for (let i2 = 0; i2 < results.length; i2++) {
          resultEdges.push(results[i2]);
        }
      }
      return resultEdges;
    } else {
      return yield* generateEdges(geometry, resultEdges, {
        projectionDirection,
        thresholdAngle,
        iterationTime
      });
    }
  }
  // Functions for generating a set of "intersection" edges within an existing geometry
  // TODO: these needs to support generating "intersection edges" within a set of other geometries, as well
  getIntersectionEdges(...args) {
    const currIterationTime = this.iterationTime;
    this.iterationTime = Infinity;
    const result = this.getIntersectionEdgesGenerator(...args).next().value;
    this.iterationTime = currIterationTime;
    return result;
  }
  *getIntersectionEdgesGenerator(geometry, resultEdges = []) {
    const { iterationTime } = this;
    if (geometry.isObject3D) {
      const meshes = getAllMeshes(geometry);
      const bvhs = /* @__PURE__ */ new Map();
      let time = performance.now();
      for (let i = 0; i < meshes.length; i++) {
        if (performance.now() - time > iterationTime) {
          yield;
          time = performance.now();
        }
        const mesh = meshes[i];
        const geometry2 = mesh.geometry;
        if (!bvhs.has(geometry2)) {
          const bvh = geometry2.boundsTree || new MeshBVH(geometry2, { maxLeafTris: 1 });
          bvhs.set(geometry2, bvh);
        }
      }
      time = performance.now();
      for (let i = 0; i < meshes.length; i++) {
        for (let j = i; j < meshes.length; j++) {
          if (performance.now() - time > iterationTime) {
            yield;
            time = performance.now();
          }
          const meshA = meshes[i];
          const meshB = meshes[j];
          const bvhA = bvhs.get(meshA.geometry);
          const bvhB = bvhs.get(meshB.geometry);
          _BtoA.copy(meshA.matrixWorld).invert().multiply(meshB.matrixWorld);
          const results = generateIntersectionEdges(bvhA, bvhB, _BtoA, []);
          transformEdges(results, meshA.matrixWorld);
          for (let i2 = 0; i2 < results.length; i2++) {
            resultEdges.push(results[i2]);
          }
        }
      }
      return resultEdges;
    } else {
      let bvh;
      if (geometry.isBufferGeometry) {
        bvh = geometry.boundsTree || new MeshBVH(geometry, { maxLeafTris: 1 });
      } else {
        bvh = geometry;
        geometry = bvh.geometry;
      }
      _BtoA.identity();
      return generateIntersectionEdges(bvh, bvh, _BtoA, resultEdges);
    }
  }
}
function transformEdges(list, matrix, offset = 1e-6) {
  for (let i = 0; i < list.length; i++) {
    const line = list[i];
    line.applyMatrix4(matrix);
    line.start.y += offset;
    line.end.y += offset;
  }
}
function edgesToGeometry(edges, heightOffset = 1e3) {
  const edgeCount = edges.length;
  const vertexCount = edgeCount * 3;
  const positions = new Float32Array(vertexCount * 3);
  const edgeIndices = new Int32Array(vertexCount);
  let positionIndex = 0;
  for (let i = 0; i < edgeCount; i++) {
    const edge = edges[i];
    const { start, end } = edge;
    edgeIndices[i * 3 + 0] = i;
    edgeIndices[i * 3 + 1] = i;
    edgeIndices[i * 3 + 2] = i;
    positions[positionIndex++] = start.x;
    positions[positionIndex++] = start.y;
    positions[positionIndex++] = start.z;
    positions[positionIndex++] = end.x;
    positions[positionIndex++] = end.y;
    positions[positionIndex++] = end.z;
    positions[positionIndex++] = start.x;
    positions[positionIndex++] = start.y + heightOffset;
    positions[positionIndex++] = start.z;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("edgeIndices", new BufferAttribute(edgeIndices, 1, false));
  return geometry;
}
const UP_VECTOR = /* @__PURE__ */ new Vector3(0, 1, 0);
function toLineGeometry(edges) {
  const edgeArray = new Float32Array(edges.length * 6);
  let c = 0;
  for (let i = 0, l = edges.length; i < l; i++) {
    const line = edges[i];
    edgeArray[c++] = line[0];
    edgeArray[c++] = 0;
    edgeArray[c++] = line[2];
    edgeArray[c++] = line[3];
    edgeArray[c++] = 0;
    edgeArray[c++] = line[5];
  }
  const edgeGeom = new BufferGeometry();
  const edgeBuffer = new BufferAttribute(edgeArray, 3, true);
  edgeGeom.setAttribute("position", edgeBuffer);
  return edgeGeom;
}
class ProjectedEdgeCollector {
  constructor(scene) {
    this.meshes = getAllMeshes(scene);
    this.bvhs = /* @__PURE__ */ new Map();
    this.visibleEdges = [];
    this.hiddenEdges = [];
    this.iterationTime = 30;
  }
  reset() {
    this.visibleEdges.length = 0;
    this.hiddenEdges.length = 0;
  }
  getVisibleLineGeometry() {
    return toLineGeometry(this.visibleEdges);
  }
  getHiddenLineGeometry() {
    return toLineGeometry(this.hiddenEdges);
  }
  addEdges(...args) {
    const currIterationTime = this.iterationTime;
    this.iterationTime = Infinity;
    const result = this.addEdgesGenerator(...args).next().value;
    this.iterationTime = currIterationTime;
    return result;
  }
  // all edges are expected to be in world coordinates
  *addEdgesGenerator(edges, options = {}) {
    const { meshes, bvhs, visibleEdges, hiddenEdges, iterationTime } = this;
    let time = performance.now();
    for (let i = 0; i < meshes.length; i++) {
      if (performance.now() - time > iterationTime) {
        yield;
        time = performance.now();
      }
      const mesh = meshes[i];
      const geometry = mesh.geometry;
      if (!bvhs.has(geometry)) {
        const bvh = geometry.boundsTree || new MeshBVH(geometry);
        bvhs.set(geometry, bvh);
      }
    }
    const hiddenOverlapMap = {};
    for (let i = 0; i < edges.length; i++) {
      hiddenOverlapMap[i] = [];
    }
    const edgesBvh = new MeshBVH(edgesToGeometry(edges), { maxLeafTris: 2, strategy: SAH });
    time = performance.now();
    for (let m = 0; m < meshes.length; m++) {
      if (performance.now() - time > iterationTime) {
        if (options.onProgress) {
          options.onProgress(m, meshes.length);
        }
        yield;
        time = performance.now();
      }
      const mesh = meshes[m];
      bvhcastEdges(edgesBvh, edges, bvhs.get(mesh.geometry), mesh, hiddenOverlapMap);
    }
    for (let i = 0; i < edges.length; i++) {
      if (performance.now() - time > iterationTime) {
        yield;
        time = performance.now();
      }
      const line = edges[i];
      const hiddenOverlaps = hiddenOverlapMap[i];
      overlapsToLines(line, hiddenOverlaps, false, visibleEdges);
      overlapsToLines(line, hiddenOverlaps, true, hiddenEdges);
    }
  }
}
class ProjectionGenerator {
  constructor() {
    this.iterationTime = 30;
    this.angleThreshold = 50;
    this.includeIntersectionEdges = true;
  }
  generateAsync(geometry, options = {}) {
    return new Promise((resolve, reject) => {
      const { signal } = options;
      const task = this.generate(geometry, options);
      run();
      function run() {
        if (signal && signal.aborted) {
          reject(new Error("ProjectionGenerator: Process aborted via AbortSignal."));
          return;
        }
        const result = task.next();
        if (result.done) {
          resolve(result.value);
        } else {
          requestAnimationFrame(run);
        }
      }
    });
  }
  *generate(scene, options) {
    const { iterationTime, angleThreshold, includeIntersectionEdges } = this;
    const { onProgress = () => {
    } } = options;
    if (scene.isBufferGeometry) {
      scene = new Mesh(scene);
    }
    const edgeGenerator = new EdgeGenerator();
    edgeGenerator.iterationTime = iterationTime;
    edgeGenerator.thresholdAngle = angleThreshold;
    edgeGenerator.projectionDirection.copy(UP_VECTOR);
    onProgress("Extracting edges");
    let edges = [];
    yield* edgeGenerator.getEdgesGenerator(scene, edges, options);
    if (includeIntersectionEdges) {
      onProgress("Extracting self-intersecting edges");
      yield* edgeGenerator.getIntersectionEdgesGenerator(scene, edges, options);
    }
    onProgress("Filtering edges");
    edges = edges.filter((e) => !isYProjectedLineDegenerate(e));
    yield;
    const collector = new ProjectedEdgeCollector(scene);
    collector.iterationTime = iterationTime;
    onProgress("Clipping edges");
    yield* collector.addEdgesGenerator(edges, {
      onProgress: !onProgress ? null : (prog, tot) => {
        onProgress("Clipping edges", prog / tot, collector);
      }
    });
    return collector;
  }
}
export {
  ProjectionGenerator as P
};
//# sourceMappingURL=ProjectionGenerator-Cx9Qc8ws.js.map
