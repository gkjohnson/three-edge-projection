import { L as Line3, V as Vector3, d as MathUtils, T as Triangle, dE as isLineTriangleEdge, M as Matrix4, ad as MeshBVH, am as BVH, n as BufferGeometry, o as BufferAttribute, t as Mesh, dB as isYProjectedLineDegenerate, ag as SAH, dF as bvhcastEdges } from "./bvhcastEdges-BzgT52m-.js";
function getAllMeshes(scene) {
  let arr;
  if (Array.isArray(scene)) {
    arr = scene;
  } else {
    arr = [scene];
  }
  const result = /* @__PURE__ */ new Set();
  for (let i = 0, l = arr.length; i < l; i++) {
    arr[i].traverse((c) => {
      if (c.geometry && c.visible) {
        result.add(c);
      }
    });
  }
  return Array.from(result);
}
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
  return invOverlaps.length;
}
class ProjectionEdge extends Line3 {
  constructor(start, end) {
    super(start, end);
    this.mesh = null;
  }
  copy(source) {
    super.copy(source);
    this.mesh = source.mesh || null;
    return this;
  }
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
          const line = new ProjectionEdge();
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
      const line = new ProjectionEdge();
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
        target.push(new ProjectionEdge().copy(_line));
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
const nextFrame = () => new Promise((resolve) => {
  let rafHandle;
  let timeoutHandle;
  const cb = () => {
    cancelAnimationFrame(rafHandle);
    clearTimeout(timeoutHandle);
    resolve();
  };
  rafHandle = requestAnimationFrame(cb);
  timeoutHandle = setTimeout(cb, 16);
});
const _BtoA = /* @__PURE__ */ new Matrix4();
const _toLocalMatrix = /* @__PURE__ */ new Matrix4();
class EdgeGenerator {
  constructor() {
    this.projectionDirection = new Vector3(0, 1, 0);
    this.thresholdAngle = 50;
    this.iterationTime = 30;
    this.yOffset = 1e-6;
  }
  // Functions for generating the "hard" and silhouette edges of the geometry along the projection direction
  getEdges(...args) {
    const currIterationTime = this.iterationTime;
    this.iterationTime = Infinity;
    const result = this.getEdgesGenerator(...args).next().value;
    this.iterationTime = currIterationTime;
    return result;
  }
  async getEdgesAsync(...args) {
    const task = this.getEdgesGenerator(...args);
    let res;
    while (!res || !res.done) {
      res = task.next();
      await nextFrame();
    }
    return res.value;
  }
  *getEdgesGenerator(geometry, resultEdges = []) {
    if (Array.isArray(geometry)) {
      for (let i = 0, l = geometry.length; i < l; i++) {
        yield* this.getEdgesGenerator(geometry[i], resultEdges);
      }
      return resultEdges;
    }
    const { projectionDirection, thresholdAngle, iterationTime, yOffset } = this;
    if (geometry.isObject3D) {
      const meshes = getAllMeshes(geometry);
      let localProjection = null;
      if (projectionDirection) {
        localProjection = new Vector3();
      }
      let time = performance.now();
      for (let i = 0; i < meshes.length; i++) {
        if (performance.now() - time > iterationTime) {
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
        transformEdges(results, mesh.matrixWorld, yOffset);
        for (let i2 = 0; i2 < results.length; i2++) {
          results[i2].mesh = mesh;
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
  async getIntersectionEdgesAsync(...args) {
    const task = this.getIntersectionEdgesGenerator(...args);
    let res;
    while (!res || !res.done) {
      res = task.next();
      await nextFrame();
    }
    return res.value;
  }
  *getIntersectionEdgesGenerator(geometry, resultEdges = []) {
    if (Array.isArray(geometry)) {
      for (let i = 0, l = geometry.length; i < l; i++) {
        yield* this.getIntersectionEdgesGenerator(geometry[i], resultEdges);
      }
      return resultEdges;
    }
    const { iterationTime, yOffset } = this;
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
          const bvh = geometry2.boundsTree || new MeshBVH(geometry2, { maxLeafSize: 1 });
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
          transformEdges(results, meshA.matrixWorld, yOffset);
          for (let i2 = 0; i2 < results.length; i2++) {
            results[i2].mesh = meshA;
            resultEdges.push(results[i2]);
          }
        }
      }
      return resultEdges;
    } else {
      let bvh;
      if (geometry.isBufferGeometry) {
        bvh = geometry.boundsTree || new MeshBVH(geometry, { maxLeafSize: 1 });
      } else {
        bvh = geometry;
        geometry = bvh.geometry;
      }
      _BtoA.identity();
      return generateIntersectionEdges(bvh, bvh, _BtoA, resultEdges);
    }
  }
}
function transformEdges(list, matrix, offset = 0) {
  for (let i = 0; i < list.length; i++) {
    const line = list[i];
    line.applyMatrix4(matrix);
    line.start.y += offset;
    line.end.y += offset;
  }
}
class LineObjectsBVH extends BVH {
  get lines() {
    return this.primitiveBuffer;
  }
  constructor(lines, options) {
    super(options);
    this.primitiveBuffer = lines;
    this.primitiveBufferStride = 1;
    this.heightOffset = options.heightOffset ?? 1e3;
    this.init(options);
  }
  writePrimitiveBounds(i, targetBuffer, writeOffset) {
    const { primitiveBuffer, heightOffset } = this;
    const { start, end } = primitiveBuffer[i];
    targetBuffer[writeOffset + 0] = Math.min(start.x, end.x);
    targetBuffer[writeOffset + 1] = Math.min(start.y, end.y);
    targetBuffer[writeOffset + 2] = Math.min(start.z, end.z);
    targetBuffer[writeOffset + 3] = Math.max(start.x, end.x);
    targetBuffer[writeOffset + 4] = Math.max(start.y, end.y) + heightOffset;
    targetBuffer[writeOffset + 5] = Math.max(start.z, end.z);
  }
  getRootRanges() {
    return [{ offset: 0, count: this.primitiveBuffer.length }];
  }
}
const UP_VECTOR = /* @__PURE__ */ new Vector3(0, 1, 0);
function toLineGeometry(edges, ranges = null) {
  const activeRanges = ranges ?? [{ start: 0, count: edges.length }];
  let totalCount = 0;
  for (let i = 0; i < activeRanges.length; i++) {
    totalCount += activeRanges[i].count;
  }
  const edgeArray = new Float32Array(totalCount * 6);
  let c = 0;
  for (let r = 0; r < activeRanges.length; r++) {
    const { start, count } = activeRanges[r];
    for (let i = start, l = start + count; i < l; i++) {
      const line = edges[i];
      edgeArray[c++] = line[0];
      edgeArray[c++] = 0;
      edgeArray[c++] = line[2];
      edgeArray[c++] = line[3];
      edgeArray[c++] = 0;
      edgeArray[c++] = line[5];
    }
  }
  const edgeGeom = new BufferGeometry();
  const edgeBuffer = new BufferAttribute(edgeArray, 3, false);
  edgeGeom.setAttribute("position", edgeBuffer);
  return edgeGeom;
}
class EdgeSet {
  constructor() {
    this.meshToSegments = /* @__PURE__ */ new Map();
    this._rangeCache = null;
  }
  getLineGeometry(meshes = null) {
    const activeMeshes = meshes !== null ? meshes : Array.from(this.meshToSegments.keys());
    const segments = [];
    for (let i = 0; i < activeMeshes.length; i++) {
      const segs = this.meshToSegments.get(activeMeshes[i]);
      if (segs) {
        for (let j = 0; j < segs.length; j++) segments.push(segs[j]);
      }
    }
    return toLineGeometry(segments);
  }
  getRangeForMesh(mesh) {
    if (!this._rangeCache) {
      this._rangeCache = /* @__PURE__ */ new Map();
      let start = 0;
      for (const [m, segs] of this.meshToSegments) {
        this._rangeCache.set(m, { start: start * 2, count: segs.length * 2 });
        start += segs.length;
      }
    }
    return this._rangeCache.get(mesh) ?? null;
  }
}
class ProjectionResult {
  constructor() {
    this.visibleEdges = new EdgeSet();
    this.hiddenEdges = new EdgeSet();
  }
}
class ProjectedEdgeCollector {
  constructor(scene) {
    this.meshes = getAllMeshes(scene);
    this.bvhs = /* @__PURE__ */ new Map();
    this.result = new ProjectionResult();
    this.iterationTime = 30;
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
    const { meshes, bvhs, iterationTime } = this;
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
    const edgesBvh = new LineObjectsBVH(edges, { maxLeafSize: 2, strategy: SAH });
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
      bvhcastEdges(edgesBvh, bvhs.get(mesh.geometry), mesh, hiddenOverlapMap);
    }
    const { result } = this;
    for (let i = 0; i < edges.length; i++) {
      if (performance.now() - time > iterationTime) {
        yield;
        time = performance.now();
      }
      const line = edges[i];
      const mesh = line.mesh;
      const hiddenOverlaps = hiddenOverlapMap[i];
      if (!result.visibleEdges.meshToSegments.has(mesh)) {
        result.visibleEdges.meshToSegments.set(mesh, []);
        result.hiddenEdges.meshToSegments.set(mesh, []);
      }
      overlapsToLines(line, hiddenOverlaps, false, result.visibleEdges.meshToSegments.get(mesh));
      overlapsToLines(line, hiddenOverlaps, true, result.hiddenEdges.meshToSegments.get(mesh));
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
  *generate(scene, options = {}) {
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
    onProgress(0, "Extracting edges");
    let edges = [];
    yield* edgeGenerator.getEdgesGenerator(scene, edges);
    if (includeIntersectionEdges) {
      onProgress(0, "Extracting self-intersecting edges");
      yield* edgeGenerator.getIntersectionEdgesGenerator(scene, edges);
    }
    onProgress(0, "Filtering edges");
    edges = edges.filter((e) => !isYProjectedLineDegenerate(e));
    edges.sort((a, b) => {
      const uuidA = a.mesh.uuid;
      const uuidB = b.mesh.uuid;
      if (uuidA === uuidB) {
        return 0;
      } else {
        return uuidA < uuidB ? -1 : 1;
      }
    });
    yield;
    const collector = new ProjectedEdgeCollector(scene);
    collector.iterationTime = iterationTime;
    onProgress(0, "Clipping edges");
    yield* collector.addEdgesGenerator(edges, {
      onProgress: !onProgress ? null : (prog, tot) => {
        onProgress(prog / tot, "Clipping edges", collector.result);
      }
    });
    return collector.result;
  }
}
export {
  EdgeGenerator as E,
  ProjectionGenerator as P,
  ProjectionResult as a,
  getAllMeshes as g,
  nextFrame as n,
  overlapsToLines as o
};
//# sourceMappingURL=ProjectionGenerator-M7W92PRG.js.map
