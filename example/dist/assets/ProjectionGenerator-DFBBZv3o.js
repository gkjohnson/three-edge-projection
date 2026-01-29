import { e as Mesh, d as LineSegments, t as LineLoop, u as Line, v as Points, w as Sphere, x as BatchedMesh, y as Line3, V as Vector3, z as Triangle, E as MathUtils, H as isLineTriangleEdge, b as Matrix4, i as MeshBVH, I as BVH, J as isYProjectedLineDegenerate, j as SAH, k as Box3, K as bvhcastEdges, B as BufferGeometry, c as BufferAttribute, p as Raycaster } from "./PlanarIntersectionGenerator-ChmpyYEB.js";
const _raycastFunctions = {
  "Mesh": Mesh.prototype.raycast,
  "Line": Line.prototype.raycast,
  "LineSegments": LineSegments.prototype.raycast,
  "LineLoop": LineLoop.prototype.raycast,
  "Points": Points.prototype.raycast,
  "BatchedMesh": BatchedMesh.prototype.raycast
};
const _mesh = /* @__PURE__ */ new Mesh();
const _batchIntersects = [];
function acceleratedRaycast(raycaster, intersects) {
  if (this.isBatchedMesh) {
    acceleratedBatchedMeshRaycast.call(this, raycaster, intersects);
  } else {
    const { geometry } = this;
    if (geometry.boundsTree) {
      geometry.boundsTree.raycastObject3D(this, raycaster, intersects);
    } else {
      let raycastFunction;
      if (this instanceof Mesh) {
        raycastFunction = _raycastFunctions.Mesh;
      } else if (this instanceof LineSegments) {
        raycastFunction = _raycastFunctions.LineSegments;
      } else if (this instanceof LineLoop) {
        raycastFunction = _raycastFunctions.LineLoop;
      } else if (this instanceof Line) {
        raycastFunction = _raycastFunctions.Line;
      } else if (this instanceof Points) {
        raycastFunction = _raycastFunctions.Points;
      } else {
        throw new Error("BVH: Fallback raycast function not found.");
      }
      raycastFunction.call(this, raycaster, intersects);
    }
  }
}
function acceleratedBatchedMeshRaycast(raycaster, intersects) {
  if (this.boundsTrees) {
    const boundsTrees = this.boundsTrees;
    const drawInfo = this._drawInfo || this._instanceInfo;
    const drawRanges = this._drawRanges || this._geometryInfo;
    const matrixWorld = this.matrixWorld;
    _mesh.material = this.material;
    _mesh.geometry = this.geometry;
    const oldBoundsTree = _mesh.geometry.boundsTree;
    const oldDrawRange = _mesh.geometry.drawRange;
    if (_mesh.geometry.boundingSphere === null) {
      _mesh.geometry.boundingSphere = new Sphere();
    }
    for (let i = 0, l = drawInfo.length; i < l; i++) {
      if (!this.getVisibleAt(i)) {
        continue;
      }
      const geometryId = drawInfo[i].geometryIndex;
      _mesh.geometry.boundsTree = boundsTrees[geometryId];
      this.getMatrixAt(i, _mesh.matrixWorld).premultiply(matrixWorld);
      if (!_mesh.geometry.boundsTree) {
        this.getBoundingBoxAt(geometryId, _mesh.geometry.boundingBox);
        this.getBoundingSphereAt(geometryId, _mesh.geometry.boundingSphere);
        const drawRange = drawRanges[geometryId];
        _mesh.geometry.setDrawRange(drawRange.start, drawRange.count);
      }
      _mesh.raycast(raycaster, _batchIntersects);
      for (let j = 0, l2 = _batchIntersects.length; j < l2; j++) {
        const intersect = _batchIntersects[j];
        intersect.object = this;
        intersect.batchId = i;
        intersects.push(intersect);
      }
      _batchIntersects.length = 0;
    }
    _mesh.geometry.boundsTree = oldBoundsTree;
    _mesh.geometry.drawRange = oldDrawRange;
    _mesh.material = null;
    _mesh.geometry = null;
  } else {
    _raycastFunctions.BatchedMesh.call(this, raycaster, intersects);
  }
}
const _line$2 = /* @__PURE__ */ new Line3();
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
    _line$2.start.lerpVectors(start, end, invOverlaps[i][0]);
    _line$2.end.lerpVectors(start, end, invOverlaps[i][1]);
    target.push(new Float32Array([
      _line$2.start.x,
      _line$2.start.y,
      _line$2.start.z,
      _line$2.end.x,
      _line$2.end.y,
      _line$2.end.z
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
const _line$1 = /* @__PURE__ */ new Line3();
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
      if (tri1.intersectsTriangle(tri2, _line$1, true) && !isLineTriangleEdge(tri1, _line$1) && !isLineTriangleEdge(tri2, _line$1)) {
        target.push(_line$1.clone());
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
function transformEdges(list, matrix, offset = 1e-6) {
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
const _raycaster = /* @__PURE__ */ new Raycaster();
const _line = /* @__PURE__ */ new Line3();
const _line0 = /* @__PURE__ */ new Line3();
const _line1 = /* @__PURE__ */ new Line3();
const _box = /* @__PURE__ */ new Box3();
const _point0 = /* @__PURE__ */ new Vector3();
const _point1 = /* @__PURE__ */ new Vector3();
const _dir0 = /* @__PURE__ */ new Vector3();
const _dir1 = /* @__PURE__ */ new Vector3();
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
    this.lineIntersectionStrategy = false;
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
    const edgesBvh = new LineObjectsBVH(edges, { maxLeafSize: 2, strategy: SAH });
    if (this.lineIntersectionStrategy) {
      meshes.forEach((c) => {
        c.geometry.boundsTree = bvhs.get(c.geometry);
        c.raycast = acceleratedRaycast;
      });
      const results = {};
      time = performance.now();
      for (let i0 = 0, l = edgesBvh.lines.length; i0 < l; i0++) {
        if (performance.now() - time > iterationTime) {
          yield;
          time = performance.now();
        }
        const e0 = edgesBvh.lines[i0];
        _line0.copy(e0);
        _line0.start.y = 0;
        _line0.end.y = 0;
        _line0.delta(_dir0).normalize();
        _box.makeEmpty();
        _box.expandByPoint(e0.start);
        _box.expandByPoint(e0.end);
        _box.max.y = 1e5;
        _box.min.y = -1e5;
        edgesBvh.shapecast({
          intersectsBounds(b) {
            return _box.intersectsBox(b);
          },
          intersectsRange(offset, count) {
            for (let i1 = offset, l2 = offset + count; i1 < l2; i1++) {
              if (i1 <= i0) {
                continue;
              }
              if (!results[i0]) results[i0] = [];
              if (!results[i1]) results[i1] = [];
              const e1 = edgesBvh.lines[i1];
              _line1.copy(e1);
              _line1.start.y = 0;
              _line1.end.y = 0;
              _line1.delta(_dir1).normalize();
              if (Math.abs(_dir0.dot(_dir1)) > 1 - 1e-5) {
                continue;
              }
              const dist = _line0.distanceSqToLine3(_line1, _point0, _point1);
              if (dist < 1e-5) {
                results[i0].push(_line0.closestPointToPointParameter(_point1));
                results[i1].push(_line1.closestPointToPointParameter(_point1));
              }
            }
          }
        });
      }
      for (let i = 0, l = edgesBvh.lines.length; i < l; i++) {
        const line = edgesBvh.lines[i];
        pushFromSplits(line, results[i] || [], meshes, bvhs, visibleEdges, objectsBVH);
      }
    } else {
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
function pushFromSplits(line, splits, meshes, bvhs, target, objectsBVH2) {
  const hits = [];
  splits.push(0, 1);
  splits.sort((a, b) => a - b);
  _raycaster.firstHitOnly = true;
  for (let i = 0; i < splits.length - 1; i++) {
    const s0 = splits[i];
    const s1 = splits[i + 1];
    if (s0 === s1) {
      continue;
    }
    const middle = (s0 + s1) / 2;
    line.at(middle, _raycaster.ray.origin);
    _raycaster.ray.origin.y += 1e4;
    _raycaster.far = 1e4;
    _raycaster.ray.direction.set(0, -1, 0);
    let visible = true;
    for (let m = 0, lm = meshes.length; m < lm; m++) {
      const mesh = meshes[m];
      const bvh = bvhs.get(mesh.geometry);
      hits.length = 0;
      bvh.raycastObject3D(mesh, _raycaster, hits);
      if (hits.length > 0) {
        visible = false;
        break;
      }
    }
    if (visible) {
      line.at(s0, _line.start);
      line.at(s1, _line.end);
      target.push(new Float32Array([
        _line.start.x,
        0,
        _line.start.z,
        _line.end.x,
        0,
        _line.end.z
      ]));
    }
  }
}
export {
  ProjectionGenerator as P
};
//# sourceMappingURL=ProjectionGenerator-DFBBZv3o.js.map
