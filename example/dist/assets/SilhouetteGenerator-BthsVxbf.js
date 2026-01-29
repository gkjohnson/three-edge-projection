import { y as Line3, aC as getTriCount, aD as getSizeSortedTriList, z as Triangle, V as Vector3, o as Vector2, aE as ShapeUtils, aF as Shape, aG as ShapeGeometry, B as BufferGeometry } from "./PlanarIntersectionGenerator-ChmpyYEB.js";
class Minkowski {
  static minkowskiInternal(pattern, path, isSum, isClosed) {
    const delta = isClosed ? 0 : 1;
    const patLen = pattern.length;
    const pathLen = path.length;
    const tmp = [];
    for (const pathPt of path) {
      const path2 = [];
      if (isSum) {
        for (const basePt of pattern)
          path2.push({ x: pathPt.x + basePt.x, y: pathPt.y + basePt.y });
      } else {
        for (const basePt of pattern)
          path2.push({ x: pathPt.x - basePt.x, y: pathPt.y - basePt.y });
      }
      tmp.push(path2);
    }
    const result = [];
    let g = isClosed ? pathLen - 1 : 0;
    let h = patLen - 1;
    for (let i = delta; i < pathLen; i++) {
      for (let j = 0; j < patLen; j++) {
        const quad = [tmp[g][h], tmp[i][h], tmp[i][j], tmp[g][j]];
        if (!Clipper.isPositive(quad))
          result.push(Clipper.reversePath(quad));
        else
          result.push(quad);
        h = j;
      }
      g = i;
    }
    return result;
  }
  static sum(pattern, path, isClosed) {
    return Clipper.Union(this.minkowskiInternal(pattern, path, true, isClosed), void 0, FillRule.NonZero);
  }
  static diff(pattern, path, isClosed) {
    return Clipper.Union(this.minkowskiInternal(pattern, path, false, isClosed), void 0, FillRule.NonZero);
  }
}
var JoinType;
(function(JoinType2) {
  JoinType2[JoinType2["Square"] = 0] = "Square";
  JoinType2[JoinType2["Round"] = 1] = "Round";
  JoinType2[JoinType2["Miter"] = 2] = "Miter";
})(JoinType || (JoinType = {}));
var EndType;
(function(EndType2) {
  EndType2[EndType2["Polygon"] = 0] = "Polygon";
  EndType2[EndType2["Joined"] = 1] = "Joined";
  EndType2[EndType2["Butt"] = 2] = "Butt";
  EndType2[EndType2["Square"] = 3] = "Square";
  EndType2[EndType2["Round"] = 4] = "Round";
})(EndType || (EndType = {}));
class Group {
  constructor(paths, joinType, endType = EndType.Polygon) {
    this.inPaths = [...paths];
    this.joinType = joinType;
    this.endType = endType;
    this.outPath = [];
    this.outPaths = [];
    this.pathsReversed = false;
  }
}
class PointD {
  constructor(xOrPt, yOrScale) {
    if (typeof xOrPt === "number" && typeof yOrScale === "number") {
      this.x = xOrPt;
      this.y = yOrScale;
    } else if (xOrPt instanceof PointD) {
      if (yOrScale !== void 0) {
        this.x = xOrPt.x * yOrScale;
        this.y = xOrPt.y * yOrScale;
      } else {
        this.x = xOrPt.x;
        this.y = xOrPt.y;
      }
    } else {
      this.x = xOrPt.x * (yOrScale || 1);
      this.y = xOrPt.y * (yOrScale || 1);
    }
  }
  toString(precision = 2) {
    return `${this.x.toFixed(precision)},${this.y.toFixed(precision)}`;
  }
  static equals(lhs, rhs) {
    return InternalClipper.isAlmostZero(lhs.x - rhs.x) && InternalClipper.isAlmostZero(lhs.y - rhs.y);
  }
  static notEquals(lhs, rhs) {
    return !InternalClipper.isAlmostZero(lhs.x - rhs.x) || !InternalClipper.isAlmostZero(lhs.y - rhs.y);
  }
  equals(obj) {
    if (obj instanceof PointD) {
      return PointD.equals(this, obj);
    }
    return false;
  }
  negate() {
    this.x = -this.x;
    this.y = -this.y;
  }
}
class ClipperOffset {
  constructor(miterLimit = 2, arcTolerance = 0, preserveCollinear = false, reverseSolution = false) {
    this._groupList = [];
    this._normals = [];
    this._solution = [];
    this.MiterLimit = miterLimit;
    this.ArcTolerance = arcTolerance;
    this.MergeGroups = true;
    this.PreserveCollinear = preserveCollinear;
    this.ReverseSolution = reverseSolution;
  }
  clear() {
    this._groupList = [];
  }
  addPath(path, joinType, endType) {
    if (path.length === 0)
      return;
    const pp = [path];
    this.addPaths(pp, joinType, endType);
  }
  addPaths(paths, joinType, endType) {
    if (paths.length === 0)
      return;
    this._groupList.push(new Group(paths, joinType, endType));
  }
  executeInternal(delta) {
    this._solution = [];
    if (this._groupList.length === 0)
      return;
    if (Math.abs(delta) < 0.5) {
      for (const group of this._groupList) {
        for (const path of group.inPaths) {
          this._solution.push(path);
        }
      }
    } else {
      this._delta = delta;
      this._mitLimSqr = this.MiterLimit <= 1 ? 2 : 2 / this.sqr(this.MiterLimit);
      for (const group of this._groupList) {
        this.doGroupOffset(group);
      }
    }
  }
  sqr(value) {
    return value * value;
  }
  execute(delta, solution) {
    solution.length = 0;
    this.executeInternal(delta);
    if (this._groupList.length === 0)
      return;
    const c = new Clipper64();
    c.preserveCollinear = this.PreserveCollinear;
    c.reverseSolution = this.ReverseSolution !== this._groupList[0].pathsReversed;
    c.addSubjectPaths(this._solution);
    if (this._groupList[0].pathsReversed)
      c.execute(ClipType.Union, FillRule.Negative, solution);
    else
      c.execute(ClipType.Union, FillRule.Positive, solution);
  }
  executePolytree(delta, polytree) {
    polytree.clear();
    this.executeInternal(delta);
    if (this._groupList.length === 0)
      return;
    const c = new Clipper64();
    c.preserveCollinear = this.PreserveCollinear;
    c.reverseSolution = this.ReverseSolution !== this._groupList[0].pathsReversed;
    c.addSubjectPaths(this._solution);
    if (this._groupList[0].pathsReversed)
      c.executePolyTree(ClipType.Union, FillRule.Negative, polytree);
    else
      c.executePolyTree(ClipType.Union, FillRule.Positive, polytree);
  }
  static getUnitNormal(pt1, pt2) {
    let dx = pt2.x - pt1.x;
    let dy = pt2.y - pt1.y;
    if (dx === 0 && dy === 0)
      return new PointD(0, 0);
    const f = 1 / Math.sqrt(dx * dx + dy * dy);
    dx *= f;
    dy *= f;
    return new PointD(dy, -dx);
  }
  executeCallback(deltaCallback, solution) {
    this.DeltaCallback = deltaCallback;
    this.execute(1, solution);
  }
  static getBoundsAndLowestPolyIdx(paths) {
    const rec = new Rect64(false);
    let lpX = Number.MIN_SAFE_INTEGER;
    let index = -1;
    for (let i = 0; i < paths.length; i++) {
      for (const pt of paths[i]) {
        if (pt.y >= rec.bottom) {
          if (pt.y > rec.bottom || pt.x < lpX) {
            index = i;
            lpX = pt.x;
            rec.bottom = pt.y;
          }
        } else if (pt.y < rec.top)
          rec.top = pt.y;
        if (pt.x > rec.right)
          rec.right = pt.x;
        else if (pt.x < rec.left)
          rec.left = pt.x;
      }
    }
    return { index, rec };
  }
  static translatePoint(pt, dx, dy) {
    return new PointD(pt.x + dx, pt.y + dy);
  }
  static reflectPoint(pt, pivot) {
    return new PointD(pivot.x + (pivot.x - pt.x), pivot.y + (pivot.y - pt.y));
  }
  static almostZero(value, epsilon = 1e-3) {
    return Math.abs(value) < epsilon;
  }
  static hypotenuse(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }
  static normalizeVector(vec) {
    const h = this.hypotenuse(vec.x, vec.y);
    if (this.almostZero(h))
      return new PointD(0, 0);
    const inverseHypot = 1 / h;
    return new PointD(vec.x * inverseHypot, vec.y * inverseHypot);
  }
  static getAvgUnitVector(vec1, vec2) {
    return this.normalizeVector(new PointD(vec1.x + vec2.x, vec1.y + vec2.y));
  }
  static intersectPoint(pt1a, pt1b, pt2a, pt2b) {
    if (InternalClipper.isAlmostZero(pt1a.x - pt1b.x)) {
      if (InternalClipper.isAlmostZero(pt2a.x - pt2b.x))
        return new PointD(0, 0);
      const m2 = (pt2b.y - pt2a.y) / (pt2b.x - pt2a.x);
      const b2 = pt2a.y - m2 * pt2a.x;
      return new PointD(pt1a.x, m2 * pt1a.x + b2);
    }
    if (InternalClipper.isAlmostZero(pt2a.x - pt2b.x)) {
      const m1 = (pt1b.y - pt1a.y) / (pt1b.x - pt1a.x);
      const b1 = pt1a.y - m1 * pt1a.x;
      return new PointD(pt2a.x, m1 * pt2a.x + b1);
    } else {
      const m1 = (pt1b.y - pt1a.y) / (pt1b.x - pt1a.x);
      const b1 = pt1a.y - m1 * pt1a.x;
      const m2 = (pt2b.y - pt2a.y) / (pt2b.x - pt2a.x);
      const b2 = pt2a.y - m2 * pt2a.x;
      if (InternalClipper.isAlmostZero(m1 - m2))
        return new PointD(0, 0);
      const x = (b2 - b1) / (m1 - m2);
      return new PointD(x, m1 * x + b1);
    }
  }
  getPerpendic(pt, norm) {
    return new Point64(pt.x + norm.x * this._groupDelta, pt.y + norm.y * this._groupDelta);
  }
  getPerpendicD(pt, norm) {
    return new PointD(pt.x + norm.x * this._groupDelta, pt.y + norm.y * this._groupDelta);
  }
  doSquare(group, path, j, k) {
    let vec;
    if (j === k) {
      vec = new PointD(this._normals[j].y, -this._normals[j].x);
    } else {
      vec = ClipperOffset.getAvgUnitVector(new PointD(-this._normals[k].y, this._normals[k].x), new PointD(this._normals[j].y, -this._normals[j].x));
    }
    const absDelta = Math.abs(this._groupDelta);
    let ptQ = new PointD(path[j].x, path[j].y);
    ptQ = ClipperOffset.translatePoint(ptQ, absDelta * vec.x, absDelta * vec.y);
    const pt1 = ClipperOffset.translatePoint(ptQ, this._groupDelta * vec.y, this._groupDelta * -vec.x);
    const pt2 = ClipperOffset.translatePoint(ptQ, this._groupDelta * -vec.y, this._groupDelta * vec.x);
    const pt3 = this.getPerpendicD(path[k], this._normals[k]);
    if (j === k) {
      const pt4 = new PointD(pt3.x + vec.x * this._groupDelta, pt3.y + vec.y * this._groupDelta);
      const pt = ClipperOffset.intersectPoint(pt1, pt2, pt3, pt4);
      group.outPath.push(new Point64(ClipperOffset.reflectPoint(pt, ptQ).x, ClipperOffset.reflectPoint(pt, ptQ).y));
      group.outPath.push(new Point64(pt.x, pt.y));
    } else {
      const pt4 = this.getPerpendicD(path[j], this._normals[k]);
      const pt = ClipperOffset.intersectPoint(pt1, pt2, pt3, pt4);
      group.outPath.push(new Point64(pt.x, pt.y));
      group.outPath.push(new Point64(ClipperOffset.reflectPoint(pt, ptQ).x, ClipperOffset.reflectPoint(pt, ptQ).y));
    }
  }
  doMiter(group, path, j, k, cosA) {
    const q = this._groupDelta / (cosA + 1);
    group.outPath.push(new Point64(path[j].x + (this._normals[k].x + this._normals[j].x) * q, path[j].y + (this._normals[k].y + this._normals[j].y) * q));
  }
  doRound(group, path, j, k, angle) {
    if (typeof this.DeltaCallback !== "undefined") {
      const absDelta = Math.abs(this._groupDelta);
      const arcTol = this.ArcTolerance > 0.01 ? this.ArcTolerance : Math.log10(2 + absDelta) * InternalClipper.defaultArcTolerance;
      const stepsPer360 = Math.PI / Math.acos(1 - arcTol / absDelta);
      this._stepSin = Math.sin(2 * Math.PI / stepsPer360);
      this._stepCos = Math.cos(2 * Math.PI / stepsPer360);
      if (this._groupDelta < 0)
        this._stepSin = -this._stepSin;
      this._stepsPerRad = stepsPer360 / (2 * Math.PI);
    }
    const pt = path[j];
    let offsetVec = new PointD(this._normals[k].x * this._groupDelta, this._normals[k].y * this._groupDelta);
    if (j === k)
      offsetVec.negate();
    group.outPath.push(new Point64(pt.x + offsetVec.x, pt.y + offsetVec.y));
    if (angle > -Math.PI + 0.01) {
      const steps = Math.ceil(this._stepsPerRad * Math.abs(angle));
      for (let i = 1; i < steps; i++) {
        offsetVec = new PointD(offsetVec.x * this._stepCos - this._stepSin * offsetVec.y, offsetVec.x * this._stepSin + offsetVec.y * this._stepCos);
        group.outPath.push(new Point64(pt.x + offsetVec.x, pt.y + offsetVec.y));
      }
    }
    group.outPath.push(this.getPerpendic(pt, this._normals[j]));
  }
  buildNormals(path) {
    const cnt = path.length;
    this._normals = [];
    this._normals.length = cnt;
    for (let i = 0; i < cnt - 1; i++) {
      this._normals.push(ClipperOffset.getUnitNormal(path[i], path[i + 1]));
    }
    this._normals.push(ClipperOffset.getUnitNormal(path[cnt - 1], path[0]));
  }
  crossProduct(vec1, vec2) {
    return vec1.y * vec2.x - vec2.y * vec1.x;
  }
  dotProduct(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
  }
  offsetPoint(group, path, j, k) {
    const sinA = this.crossProduct(this._normals[j], this._normals[k]);
    let cosA = this.dotProduct(this._normals[j], this._normals[k]);
    if (sinA > 1)
      cosA = 1;
    else if (sinA < -1)
      cosA = -1;
    if (typeof this.DeltaCallback !== "undefined") {
      this._groupDelta = this.DeltaCallback(path, this._normals, j, k);
      if (group.pathsReversed)
        this._groupDelta = -this._groupDelta;
    }
    if (Math.abs(this._groupDelta) < ClipperOffset.Tolerance) {
      group.outPath.push(path[j]);
      return;
    }
    if (cosA > 0.999) {
      this.doMiter(group, path, j, k, cosA);
    } else if (cosA > -0.99 && sinA * this._groupDelta < 0) {
      group.outPath.push(this.getPerpendic(path[j], this._normals[k]));
      group.outPath.push(path[j]);
      group.outPath.push(this.getPerpendic(path[j], this._normals[j]));
    } else if (this._joinType === JoinType.Miter) {
      if (cosA > this._mitLimSqr - 1) {
        this.doMiter(group, path, j, k, cosA);
      } else {
        this.doSquare(group, path, j, k);
      }
    } else if (cosA > 0.99 || this._joinType === JoinType.Square) {
      this.doSquare(group, path, j, k);
    } else {
      this.doRound(group, path, j, k, Math.atan2(sinA, cosA));
    }
    k = j;
  }
  offsetPolygon(group, path) {
    const area = Clipper.area(path);
    if (area < 0 !== this._groupDelta < 0) {
      const rect = Clipper.getBounds(path);
      if (Math.abs(this._groupDelta) * 2 > rect.width)
        return;
    }
    group.outPath = [];
    const cnt = path.length;
    const prev = cnt - 1;
    for (let i = 0; i < cnt; i++) {
      this.offsetPoint(group, path, i, prev);
    }
    group.outPaths.push(group.outPath);
  }
  offsetOpenJoined(group, path) {
    this.offsetPolygon(group, path);
    path = Clipper.reversePath(path);
    this.buildNormals(path);
    this.offsetPolygon(group, path);
  }
  offsetOpenPath(group, path) {
    group.outPath = [];
    const highI = path.length - 1;
    if (typeof this.DeltaCallback !== "undefined") {
      this._groupDelta = this.DeltaCallback(path, this._normals, 0, 0);
    }
    if (Math.abs(this._groupDelta) < ClipperOffset.Tolerance) {
      group.outPath.push(path[0]);
    } else {
      switch (this._endType) {
        case EndType.Butt:
          group.outPath.push(new Point64(path[0].x - this._normals[0].x * this._groupDelta, path[0].y - this._normals[0].y * this._groupDelta));
          group.outPath.push(this.getPerpendic(path[0], this._normals[0]));
          break;
        case EndType.Round:
          this.doRound(group, path, 0, 0, Math.PI);
          break;
        default:
          this.doSquare(group, path, 0, 0);
          break;
      }
    }
    for (let i = 1, k = 0; i < highI; i++) {
      this.offsetPoint(group, path, i, k);
    }
    for (let i = highI; i > 0; i--) {
      this._normals[i] = new PointD(-this._normals[i - 1].x, -this._normals[i - 1].y);
    }
    this._normals[0] = this._normals[highI];
    if (typeof this.DeltaCallback !== "undefined") {
      this._groupDelta = this.DeltaCallback(path, this._normals, highI, highI);
    }
    if (Math.abs(this._groupDelta) < ClipperOffset.Tolerance) {
      group.outPath.push(path[highI]);
    } else {
      switch (this._endType) {
        case EndType.Butt:
          group.outPath.push(new Point64(path[highI].x - this._normals[highI].x * this._groupDelta, path[highI].y - this._normals[highI].y * this._groupDelta));
          group.outPath.push(this.getPerpendic(path[highI], this._normals[highI]));
          break;
        case EndType.Round:
          this.doRound(group, path, highI, highI, Math.PI);
          break;
        default:
          this.doSquare(group, path, highI, highI);
          break;
      }
    }
    for (let i = highI, k = 0; i > 0; i--) {
      this.offsetPoint(group, path, i, k);
    }
    group.outPaths.push(group.outPath);
  }
  doGroupOffset(group) {
    if (group.endType == EndType.Polygon) {
      const { index } = ClipperOffset.getBoundsAndLowestPolyIdx(group.inPaths);
      if (index < 0)
        return;
      const area = Clipper.area(group.inPaths[index]);
      group.pathsReversed = area < 0;
      if (group.pathsReversed) {
        this._groupDelta = -this._delta;
      } else {
        this._groupDelta = this._delta;
      }
    } else {
      group.pathsReversed = false;
      this._groupDelta = Math.abs(this._delta) * 0.5;
    }
    const absDelta = Math.abs(this._groupDelta);
    this._joinType = group.joinType;
    this._endType = group.endType;
    if (!this.DeltaCallback && (group.joinType == JoinType.Round || group.endType == EndType.Round)) {
      const arcTol = this.ArcTolerance > 0.01 ? this.ArcTolerance : Math.log10(2 + absDelta) * InternalClipper.defaultArcTolerance;
      const stepsPer360 = Math.PI / Math.acos(1 - arcTol / absDelta);
      this._stepSin = Math.sin(2 * Math.PI / stepsPer360);
      this._stepCos = Math.cos(2 * Math.PI / stepsPer360);
      if (this._groupDelta < 0) {
        this._stepSin = -this._stepSin;
      }
      this._stepsPerRad = stepsPer360 / (2 * Math.PI);
    }
    const isJoined = group.endType == EndType.Joined || group.endType == EndType.Polygon;
    for (const p of group.inPaths) {
      const path = Clipper.stripDuplicates(p, isJoined);
      const cnt = path.length;
      if (cnt === 0 || cnt < 3 && this._endType == EndType.Polygon) {
        continue;
      }
      if (cnt == 1) {
        group.outPath = [];
        if (group.endType == EndType.Round) {
          const r = absDelta;
          group.outPath = Clipper.ellipse(path[0], r, r);
        } else {
          const d = Math.ceil(this._groupDelta);
          const r = new Rect64(path[0].x - d, path[0].y - d, path[0].x - d, path[0].y - d);
          group.outPath = r.asPath();
        }
        group.outPaths.push(group.outPath);
      } else {
        if (cnt == 2 && group.endType == EndType.Joined) {
          if (group.joinType == JoinType.Round) {
            this._endType = EndType.Round;
          } else {
            this._endType = EndType.Square;
          }
        }
        this.buildNormals(path);
        if (this._endType == EndType.Polygon) {
          this.offsetPolygon(group, path);
        } else if (this._endType == EndType.Joined) {
          this.offsetOpenJoined(group, path);
        } else {
          this.offsetOpenPath(group, path);
        }
      }
    }
    this._solution.push(...group.outPaths);
    group.outPaths = [];
  }
}
ClipperOffset.Tolerance = 1e-12;
class OutPt2 {
  constructor(pt) {
    this.pt = pt;
    this.ownerIdx = 0;
  }
}
var Location;
(function(Location2) {
  Location2[Location2["left"] = 0] = "left";
  Location2[Location2["top"] = 1] = "top";
  Location2[Location2["right"] = 2] = "right";
  Location2[Location2["bottom"] = 3] = "bottom";
  Location2[Location2["inside"] = 4] = "inside";
})(Location || (Location = {}));
class RectClip64 {
  constructor(rect) {
    this.currIdx = -1;
    this.rect = rect;
    this.mp = rect.midPoint();
    this.rectPath = rect.asPath();
    this.results = [];
    this.edges = Array(8).fill(void 0).map(() => []);
  }
  add(pt, startingNewPath = false) {
    let currIdx = this.results.length;
    let result;
    if (currIdx === 0 || startingNewPath) {
      result = new OutPt2(pt);
      this.results.push(result);
      result.ownerIdx = currIdx;
      result.prev = result;
      result.next = result;
    } else {
      currIdx--;
      const prevOp = this.results[currIdx];
      if (prevOp.pt === pt)
        return prevOp;
      result = new OutPt2(pt);
      result.ownerIdx = currIdx;
      result.next = prevOp.next;
      prevOp.next.prev = result;
      prevOp.next = result;
      result.prev = prevOp;
      this.results[currIdx] = result;
    }
    return result;
  }
  static path1ContainsPath2(path1, path2) {
    let ioCount = 0;
    for (const pt of path2) {
      const pip = InternalClipper.pointInPolygon(pt, path1);
      switch (pip) {
        case PointInPolygonResult.IsInside:
          ioCount--;
          break;
        case PointInPolygonResult.IsOutside:
          ioCount++;
          break;
      }
      if (Math.abs(ioCount) > 1)
        break;
    }
    return ioCount <= 0;
  }
  static isClockwise(prev, curr, prevPt, currPt, rectMidPoint) {
    if (this.areOpposites(prev, curr))
      return InternalClipper.crossProduct(prevPt, rectMidPoint, currPt) < 0;
    else
      return this.headingClockwise(prev, curr);
  }
  static areOpposites(prev, curr) {
    return Math.abs(prev - curr) === 2;
  }
  static headingClockwise(prev, curr) {
    return (prev + 1) % 4 === curr;
  }
  static getAdjacentLocation(loc, isClockwise) {
    const delta = isClockwise ? 1 : 3;
    return (loc + delta) % 4;
  }
  static unlinkOp(op) {
    if (op.next === op)
      return void 0;
    op.prev.next = op.next;
    op.next.prev = op.prev;
    return op.next;
  }
  static unlinkOpBack(op) {
    if (op.next === op)
      return void 0;
    op.prev.next = op.next;
    op.next.prev = op.prev;
    return op.prev;
  }
  static getEdgesForPt(pt, rec) {
    let result = 0;
    if (pt.x === rec.left)
      result = 1;
    else if (pt.x === rec.right)
      result = 4;
    if (pt.y === rec.top)
      result += 2;
    else if (pt.y === rec.bottom)
      result += 8;
    return result;
  }
  static isHeadingClockwise(pt1, pt2, edgeIdx) {
    switch (edgeIdx) {
      case 0:
        return pt2.y < pt1.y;
      case 1:
        return pt2.x > pt1.x;
      case 2:
        return pt2.y > pt1.y;
      default:
        return pt2.x < pt1.x;
    }
  }
  static hasHorzOverlap(left1, right1, left2, right2) {
    return left1.x < right2.x && right1.x > left2.x;
  }
  static hasVertOverlap(top1, bottom1, top2, bottom2) {
    return top1.y < bottom2.y && bottom1.y > top2.y;
  }
  static addToEdge(edge, op) {
    if (op.edge)
      return;
    op.edge = edge;
    edge.push(op);
  }
  static uncoupleEdge(op) {
    if (!op.edge)
      return;
    for (let i = 0; i < op.edge.length; i++) {
      const op2 = op.edge[i];
      if (op2 === op) {
        op.edge[i] = void 0;
        break;
      }
    }
    op.edge = void 0;
  }
  static setNewOwner(op, newIdx) {
    op.ownerIdx = newIdx;
    let op2 = op.next;
    while (op2 !== op) {
      op2.ownerIdx = newIdx;
      op2 = op2.next;
    }
  }
  addCorner(prev, curr) {
    if (RectClip64.headingClockwise(prev, curr))
      this.add(this.rectPath[prev]);
    else
      this.add(this.rectPath[curr]);
  }
  addCornerByRef(loc, isClockwise) {
    if (isClockwise) {
      this.add(this.rectPath[loc]);
      loc = RectClip64.getAdjacentLocation(loc, true);
    } else {
      loc = RectClip64.getAdjacentLocation(loc, false);
      this.add(this.rectPath[loc]);
    }
  }
  static getLocation(rec, pt) {
    let loc;
    if (pt.x === rec.left && pt.y >= rec.top && pt.y <= rec.bottom) {
      loc = Location.left;
      return { success: false, loc };
    }
    if (pt.x === rec.right && pt.y >= rec.top && pt.y <= rec.bottom) {
      loc = Location.right;
      return { success: false, loc };
    }
    if (pt.y === rec.top && pt.x >= rec.left && pt.x <= rec.right) {
      loc = Location.top;
      return { success: false, loc };
    }
    if (pt.y === rec.bottom && pt.x >= rec.left && pt.x <= rec.right) {
      loc = Location.bottom;
      return { success: false, loc };
    }
    if (pt.x < rec.left)
      loc = Location.left;
    else if (pt.x > rec.right)
      loc = Location.right;
    else if (pt.y < rec.top)
      loc = Location.top;
    else if (pt.y > rec.bottom)
      loc = Location.bottom;
    else
      loc = Location.inside;
    return { success: true, loc };
  }
  static getIntersection(rectPath, p, p2, loc) {
    let ip = new Point64();
    switch (loc) {
      case Location.left:
        if (InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[3], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[3]).ip;
        } else if (p.y < rectPath[0].y && InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[1], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[1]).ip;
          loc = Location.top;
        } else if (InternalClipper.segsIntersect(p, p2, rectPath[2], rectPath[3], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[2], rectPath[3]).ip;
          loc = Location.bottom;
        } else {
          return { success: false, loc, ip };
        }
        break;
      case Location.right:
        if (InternalClipper.segsIntersect(p, p2, rectPath[1], rectPath[2], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[1], rectPath[2]).ip;
        } else if (p.y < rectPath[0].y && InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[1], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[1]).ip;
          loc = Location.top;
        } else if (InternalClipper.segsIntersect(p, p2, rectPath[2], rectPath[3], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[2], rectPath[3]).ip;
          loc = Location.bottom;
        } else {
          return { success: false, loc, ip };
        }
        break;
      case Location.top:
        if (InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[1], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[1]).ip;
        } else if (p.x < rectPath[0].x && InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[3], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[3]).ip;
          loc = Location.left;
        } else if (p.x > rectPath[1].x && InternalClipper.segsIntersect(p, p2, rectPath[1], rectPath[2], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[1], rectPath[2]).ip;
          loc = Location.right;
        } else {
          return { success: false, loc, ip };
        }
        break;
      case Location.bottom:
        if (InternalClipper.segsIntersect(p, p2, rectPath[2], rectPath[3], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[2], rectPath[3]).ip;
        } else if (p.x < rectPath[3].x && InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[3], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[3]).ip;
          loc = Location.left;
        } else if (p.x > rectPath[2].x && InternalClipper.segsIntersect(p, p2, rectPath[1], rectPath[2], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[1], rectPath[2]).ip;
          loc = Location.right;
        } else {
          return { success: false, loc, ip };
        }
        break;
      case Location.inside:
        if (InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[3], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[3]).ip;
          loc = Location.left;
        } else if (InternalClipper.segsIntersect(p, p2, rectPath[0], rectPath[1], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[0], rectPath[1]).ip;
          loc = Location.top;
        } else if (InternalClipper.segsIntersect(p, p2, rectPath[1], rectPath[2], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[1], rectPath[2]).ip;
          loc = Location.right;
        } else if (InternalClipper.segsIntersect(p, p2, rectPath[2], rectPath[3], true)) {
          ip = InternalClipper.getIntersectPt(p, p2, rectPath[2], rectPath[3]).ip;
          loc = Location.bottom;
        } else {
          return { success: false, loc, ip };
        }
        break;
    }
    return { success: true, loc, ip };
  }
  getNextLocation(path, context) {
    switch (context.loc) {
      case Location.left:
        while (context.i <= context.highI && path[context.i].x <= this.rect.left)
          context.i++;
        if (context.i > context.highI)
          break;
        if (path[context.i].x >= this.rect.right)
          context.loc = Location.right;
        else if (path[context.i].y <= this.rect.top)
          context.loc = Location.top;
        else if (path[context.i].y >= this.rect.bottom)
          context.loc = Location.bottom;
        else
          context.loc = Location.inside;
        break;
      case Location.top:
        while (context.i <= context.highI && path[context.i].y <= this.rect.top)
          context.i++;
        if (context.i > context.highI)
          break;
        if (path[context.i].y >= this.rect.bottom)
          context.loc = Location.bottom;
        else if (path[context.i].x <= this.rect.left)
          context.loc = Location.left;
        else if (path[context.i].x >= this.rect.right)
          context.loc = Location.right;
        else
          context.loc = Location.inside;
        break;
      case Location.right:
        while (context.i <= context.highI && path[context.i].x >= this.rect.right)
          context.i++;
        if (context.i > context.highI)
          break;
        if (path[context.i].x <= this.rect.left)
          context.loc = Location.left;
        else if (path[context.i].y <= this.rect.top)
          context.loc = Location.top;
        else if (path[context.i].y >= this.rect.bottom)
          context.loc = Location.bottom;
        else
          context.loc = Location.inside;
        break;
      case Location.bottom:
        while (context.i <= context.highI && path[context.i].y >= this.rect.bottom)
          context.i++;
        if (context.i > context.highI)
          break;
        if (path[context.i].y <= this.rect.top)
          context.loc = Location.top;
        else if (path[context.i].x <= this.rect.left)
          context.loc = Location.left;
        else if (path[context.i].x >= this.rect.right)
          context.loc = Location.right;
        else
          context.loc = Location.inside;
        break;
      case Location.inside:
        while (context.i <= context.highI) {
          if (path[context.i].x < this.rect.left)
            context.loc = Location.left;
          else if (path[context.i].x > this.rect.right)
            context.loc = Location.right;
          else if (path[context.i].y > this.rect.bottom)
            context.loc = Location.bottom;
          else if (path[context.i].y < this.rect.top)
            context.loc = Location.top;
          else {
            this.add(path[context.i]);
            context.i++;
            continue;
          }
          break;
        }
        break;
    }
  }
  executeInternal(path) {
    if (path.length < 3 || this.rect.isEmpty())
      return;
    const startLocs = [];
    let firstCross = Location.inside;
    let crossingLoc = firstCross, prev = firstCross;
    let i;
    const highI = path.length - 1;
    let result = RectClip64.getLocation(this.rect, path[highI]);
    let loc = result.loc;
    if (!result.success) {
      i = highI - 1;
      while (i >= 0 && !result.success) {
        i--;
        result = RectClip64.getLocation(this.rect, path[i]);
        prev = result.loc;
      }
      if (i < 0) {
        for (const pt of path) {
          this.add(pt);
        }
        return;
      }
      if (prev == Location.inside)
        loc = Location.inside;
    }
    const startingLoc = loc;
    i = 0;
    while (i <= highI) {
      prev = loc;
      const prevCrossLoc = crossingLoc;
      this.getNextLocation(path, { loc, i, highI });
      if (i > highI)
        break;
      const prevPt = i == 0 ? path[highI] : path[i - 1];
      crossingLoc = loc;
      let result2 = RectClip64.getIntersection(this.rectPath, path[i], prevPt, crossingLoc);
      const ip = result2.ip;
      if (!result2.success) {
        if (prevCrossLoc == Location.inside) {
          const isClockw = RectClip64.isClockwise(prev, loc, prevPt, path[i], this.mp);
          do {
            startLocs.push(prev);
            prev = RectClip64.getAdjacentLocation(prev, isClockw);
          } while (prev != loc);
          crossingLoc = prevCrossLoc;
        } else if (prev != Location.inside && prev != loc) {
          const isClockw = RectClip64.isClockwise(prev, loc, prevPt, path[i], this.mp);
          do {
            this.addCornerByRef(prev, isClockw);
          } while (prev != loc);
        }
        ++i;
        continue;
      }
      if (loc == Location.inside) {
        if (firstCross == Location.inside) {
          firstCross = crossingLoc;
          startLocs.push(prev);
        } else if (prev != crossingLoc) {
          const isClockw = RectClip64.isClockwise(prev, crossingLoc, prevPt, path[i], this.mp);
          do {
            this.addCornerByRef(prev, isClockw);
          } while (prev != crossingLoc);
        }
      } else if (prev != Location.inside) {
        loc = prev;
        result2 = RectClip64.getIntersection(this.rectPath, prevPt, path[i], loc);
        const ip2 = result2.ip;
        if (prevCrossLoc != Location.inside && prevCrossLoc != loc)
          this.addCorner(prevCrossLoc, loc);
        if (firstCross == Location.inside) {
          firstCross = loc;
          startLocs.push(prev);
        }
        loc = crossingLoc;
        this.add(ip2);
        if (ip == ip2) {
          loc = RectClip64.getLocation(this.rect, path[i]).loc;
          this.addCorner(crossingLoc, loc);
          crossingLoc = loc;
          continue;
        }
      } else {
        loc = crossingLoc;
        if (firstCross == Location.inside)
          firstCross = crossingLoc;
      }
      this.add(ip);
    }
    if (firstCross == Location.inside) {
      if (startingLoc != Location.inside) {
        if (this.pathBounds.containsRect(this.rect) && RectClip64.path1ContainsPath2(path, this.rectPath)) {
          for (let j = 0; j < 4; j++) {
            this.add(this.rectPath[j]);
            RectClip64.addToEdge(this.edges[j * 2], this.results[0]);
          }
        }
      }
    } else if (loc != Location.inside && (loc != firstCross || startLocs.length > 2)) {
      if (startLocs.length > 0) {
        prev = loc;
        for (const loc2 of startLocs) {
          if (prev == loc2)
            continue;
          this.addCornerByRef(prev, RectClip64.headingClockwise(prev, loc2));
          prev = loc2;
        }
        loc = prev;
      }
      if (loc != firstCross)
        this.addCornerByRef(loc, RectClip64.headingClockwise(loc, firstCross));
    }
  }
  execute(paths) {
    const result = [];
    if (this.rect.isEmpty())
      return result;
    for (const path of paths) {
      if (path.length < 3)
        continue;
      this.pathBounds = Clipper.getBounds(path);
      if (!this.rect.intersects(this.pathBounds))
        continue;
      else if (this.rect.containsRect(this.pathBounds)) {
        result.push(path);
        continue;
      }
      this.executeInternal(path);
      this.checkEdges();
      for (let i = 0; i < 4; ++i)
        this.tidyEdgePair(i, this.edges[i * 2], this.edges[i * 2 + 1]);
      for (const op of this.results) {
        const tmp = this.getPath(op);
        if (tmp.length > 0)
          result.push(tmp);
      }
      this.results.length = 0;
      for (let i = 0; i < 8; i++)
        this.edges[i].length = 0;
    }
    return result;
  }
  checkEdges() {
    for (let i = 0; i < this.results.length; i++) {
      let op = this.results[i];
      let op2 = op;
      if (op === void 0)
        continue;
      do {
        if (InternalClipper.crossProduct(op2.prev.pt, op2.pt, op2.next.pt) === 0) {
          if (op2 === op) {
            op2 = RectClip64.unlinkOpBack(op2);
            if (op2 === void 0)
              break;
            op = op2.prev;
          } else {
            op2 = RectClip64.unlinkOpBack(op2);
            if (op2 === void 0)
              break;
          }
        } else {
          op2 = op2.next;
        }
      } while (op2 !== op);
      if (op2 === void 0) {
        this.results[i] = void 0;
        continue;
      }
      this.results[i] = op2;
      let edgeSet1 = RectClip64.getEdgesForPt(op.prev.pt, this.rect);
      op2 = op;
      do {
        const edgeSet2 = RectClip64.getEdgesForPt(op2.pt, this.rect);
        if (edgeSet2 !== 0 && op2.edge === void 0) {
          const combinedSet = edgeSet1 & edgeSet2;
          for (let j = 0; j < 4; ++j) {
            if ((combinedSet & 1 << j) !== 0) {
              if (RectClip64.isHeadingClockwise(op2.prev.pt, op2.pt, j))
                RectClip64.addToEdge(this.edges[j * 2], op2);
              else
                RectClip64.addToEdge(this.edges[j * 2 + 1], op2);
            }
          }
        }
        edgeSet1 = edgeSet2;
        op2 = op2.next;
      } while (op2 !== op);
    }
  }
  tidyEdgePair(idx, cw, ccw) {
    if (ccw.length === 0)
      return;
    const isHorz = idx === 1 || idx === 3;
    const cwIsTowardLarger = idx === 1 || idx === 2;
    let i = 0, j = 0;
    let p1, p2, p1a, p2a, op, op2;
    while (i < cw.length) {
      p1 = cw[i];
      if (!p1 || p1.next === p1.prev) {
        cw[i++] = void 0;
        j = 0;
        continue;
      }
      const jLim = ccw.length;
      while (j < jLim && (!ccw[j] || ccw[j].next === ccw[j].prev))
        ++j;
      if (j === jLim) {
        ++i;
        j = 0;
        continue;
      }
      if (cwIsTowardLarger) {
        p1 = cw[i].prev;
        p1a = cw[i];
        p2 = ccw[j];
        p2a = ccw[j].prev;
      } else {
        p1 = cw[i];
        p1a = cw[i].prev;
        p2 = ccw[j].prev;
        p2a = ccw[j];
      }
      if (isHorz && !RectClip64.hasHorzOverlap(p1.pt, p1a.pt, p2.pt, p2a.pt) || !isHorz && !RectClip64.hasVertOverlap(p1.pt, p1a.pt, p2.pt, p2a.pt)) {
        ++j;
        continue;
      }
      const isRejoining = cw[i].ownerIdx !== ccw[j].ownerIdx;
      if (isRejoining) {
        this.results[p2.ownerIdx] = void 0;
        RectClip64.setNewOwner(p2, p1.ownerIdx);
      }
      if (cwIsTowardLarger) {
        p1.next = p2;
        p2.prev = p1;
        p1a.prev = p2a;
        p2a.next = p1a;
      } else {
        p1.prev = p2;
        p2.next = p1;
        p1a.next = p2a;
        p2a.prev = p1a;
      }
      if (!isRejoining) {
        const new_idx = this.results.length;
        this.results.push(p1a);
        RectClip64.setNewOwner(p1a, new_idx);
      }
      if (cwIsTowardLarger) {
        op = p2;
        op2 = p1a;
      } else {
        op = p1;
        op2 = p2a;
      }
      this.results[op.ownerIdx] = op;
      this.results[op2.ownerIdx] = op2;
      let opIsLarger, op2IsLarger;
      if (isHorz) {
        opIsLarger = op.pt.x > op.prev.pt.x;
        op2IsLarger = op2.pt.x > op2.prev.pt.x;
      } else {
        opIsLarger = op.pt.y > op.prev.pt.y;
        op2IsLarger = op2.pt.y > op2.prev.pt.y;
      }
      if (op.next === op.prev || op.pt === op.prev.pt) {
        if (op2IsLarger === cwIsTowardLarger) {
          cw[i] = op2;
          ccw[j++] = void 0;
        } else {
          ccw[j] = op2;
          cw[i++] = void 0;
        }
      } else if (op2.next === op2.prev || op2.pt === op2.prev.pt) {
        if (opIsLarger === cwIsTowardLarger) {
          cw[i] = op;
          ccw[j++] = void 0;
        } else {
          ccw[j] = op;
          cw[i++] = void 0;
        }
      } else if (opIsLarger === op2IsLarger) {
        if (opIsLarger === cwIsTowardLarger) {
          cw[i] = op;
          RectClip64.uncoupleEdge(op2);
          RectClip64.addToEdge(cw, op2);
          ccw[j++] = void 0;
        } else {
          cw[i++] = void 0;
          ccw[j] = op2;
          RectClip64.uncoupleEdge(op);
          RectClip64.addToEdge(ccw, op);
          j = 0;
        }
      } else {
        if (opIsLarger === cwIsTowardLarger)
          cw[i] = op;
        else
          ccw[j] = op;
        if (op2IsLarger === cwIsTowardLarger)
          cw[i] = op2;
        else
          ccw[j] = op2;
      }
    }
  }
  getPath(op) {
    const result = new Path64();
    if (!op || op.prev === op.next)
      return result;
    let op2 = op.next;
    while (op2 && op2 !== op) {
      if (InternalClipper.crossProduct(op2.prev.pt, op2.pt, op2.next.pt) === 0) {
        op = op2.prev;
        op2 = RectClip64.unlinkOp(op2);
      } else {
        op2 = op2.next;
      }
    }
    if (!op2)
      return new Path64();
    result.push(op.pt);
    op2 = op.next;
    while (op2 !== op) {
      result.push(op2.pt);
      op2 = op2.next;
    }
    return result;
  }
}
class RectClipLines64 extends RectClip64 {
  constructor(rect) {
    super(rect);
  }
  execute(paths) {
    const result = new Paths64();
    if (this.rect.isEmpty())
      return result;
    for (const path of paths) {
      if (path.length < 2)
        continue;
      this.pathBounds = Clipper.getBounds(path);
      if (!this.rect.intersects(this.pathBounds))
        continue;
      this.executeInternal(path);
      for (const op of this.results) {
        const tmp = this.getPath(op);
        if (tmp.length > 0)
          result.push(tmp);
      }
      this.results.length = 0;
      for (let i = 0; i < 8; i++) {
        this.edges[i].length = 0;
      }
    }
    return result;
  }
  getPath(op) {
    const result = new Path64();
    if (!op || op === op.next)
      return result;
    op = op.next;
    result.push(op.pt);
    let op2 = op.next;
    while (op2 !== op) {
      result.push(op2.pt);
      op2 = op2.next;
    }
    return result;
  }
  executeInternal(path) {
    this.results = [];
    if (path.length < 2 || this.rect.isEmpty())
      return;
    let prev = Location.inside;
    let i = 1;
    const highI = path.length - 1;
    let result = RectClipLines64.getLocation(this.rect, path[0]);
    let loc = result.loc;
    if (!result.success) {
      while (i <= highI && !result.success) {
        i++;
        result = RectClipLines64.getLocation(this.rect, path[i]);
        prev = result.loc;
      }
      if (i > highI) {
        for (const pt of path)
          this.add(pt);
      }
      if (prev == Location.inside)
        loc = Location.inside;
      i = 1;
    }
    if (loc == Location.inside)
      this.add(path[0]);
    while (i <= highI) {
      prev = loc;
      this.getNextLocation(path, { loc, i, highI });
      if (i > highI)
        break;
      const prevPt = path[i - 1];
      let crossingLoc = loc;
      let result2 = RectClipLines64.getIntersection(this.rectPath, path[i], prevPt, crossingLoc);
      const ip = result2.ip;
      crossingLoc = result2.loc;
      if (!result2.success) {
        i++;
        continue;
      }
      if (loc == Location.inside) {
        this.add(ip, true);
      } else if (prev !== Location.inside) {
        crossingLoc = prev;
        result2 = RectClipLines64.getIntersection(this.rectPath, prevPt, path[i], crossingLoc);
        const ip2 = result2.ip;
        crossingLoc = result2.loc;
        this.add(ip2);
        this.add(ip);
      } else {
        this.add(ip);
      }
    }
  }
}
class Clipper {
  static get InvalidRect64() {
    if (!Clipper.invalidRect64)
      Clipper.invalidRect64 = new Rect64(false);
    return this.invalidRect64;
  }
  static Intersect(subject, clip, fillRule) {
    return this.BooleanOp(ClipType.Intersection, subject, clip, fillRule);
  }
  static Union(subject, clip, fillRule = FillRule.EvenOdd) {
    return this.BooleanOp(ClipType.Union, subject, clip, fillRule);
  }
  static Difference(subject, clip, fillRule) {
    return this.BooleanOp(ClipType.Difference, subject, clip, fillRule);
  }
  static Xor(subject, clip, fillRule) {
    return this.BooleanOp(ClipType.Xor, subject, clip, fillRule);
  }
  static BooleanOp(clipType, subject, clip, fillRule = FillRule.EvenOdd) {
    const solution = new Paths64();
    if (!subject)
      return solution;
    const c = new Clipper64();
    c.addPaths(subject, PathType.Subject);
    if (clip)
      c.addPaths(clip, PathType.Clip);
    c.execute(clipType, fillRule, solution);
    return solution;
  }
  //public static BooleanOp(clipType: ClipType, subject: Paths64, clip: Paths64, polytree: PolyTree64, fillRule: FillRule): void {
  //  if (!subject) return;
  //  const c: Clipper64 = new Clipper64();
  //  c.addPaths(subject, PathType.Subject);
  //  if (clip)
  //    c.addPaths(clip, PathType.Clip);
  //  c.execute(clipType, fillRule, polytree);
  //}
  static InflatePaths(paths, delta, joinType, endType, miterLimit = 2) {
    const co = new ClipperOffset(miterLimit);
    co.addPaths(paths, joinType, endType);
    const solution = new Paths64();
    co.execute(delta, solution);
    return solution;
  }
  static RectClipPaths(rect, paths) {
    if (rect.isEmpty() || paths.length === 0)
      return new Paths64();
    const rc = new RectClip64(rect);
    return rc.execute(paths);
  }
  static RectClip(rect, path) {
    if (rect.isEmpty() || path.length === 0)
      return new Paths64();
    const tmp = new Paths64();
    tmp.push(path);
    return this.RectClipPaths(rect, tmp);
  }
  static RectClipLinesPaths(rect, paths) {
    if (rect.isEmpty() || paths.length === 0)
      return new Paths64();
    const rc = new RectClipLines64(rect);
    return rc.execute(paths);
  }
  static RectClipLines(rect, path) {
    if (rect.isEmpty() || path.length === 0)
      return new Paths64();
    const tmp = new Paths64();
    tmp.push(path);
    return this.RectClipLinesPaths(rect, tmp);
  }
  static MinkowskiSum(pattern, path, isClosed) {
    return Minkowski.sum(pattern, path, isClosed);
  }
  static MinkowskiDiff(pattern, path, isClosed) {
    return Minkowski.diff(pattern, path, isClosed);
  }
  static area(path) {
    let a = 0;
    const cnt = path.length;
    if (cnt < 3)
      return 0;
    let prevPt = path[cnt - 1];
    for (const pt of path) {
      a += (prevPt.y + pt.y) * (prevPt.x - pt.x);
      prevPt = pt;
    }
    return a * 0.5;
  }
  static areaPaths(paths) {
    let a = 0;
    for (const path of paths)
      a += this.area(path);
    return a;
  }
  static isPositive(poly) {
    return this.area(poly) >= 0;
  }
  static path64ToString(path) {
    let result = "";
    for (const pt of path)
      result += pt.toString();
    return result + "\n";
  }
  static paths64ToString(paths) {
    let result = "";
    for (const path of paths)
      result += this.path64ToString(path);
    return result;
  }
  static offsetPath(path, dx, dy) {
    const result = new Path64();
    for (const pt of path)
      result.push(new Point64(pt.x + dx, pt.y + dy));
    return result;
  }
  static scalePoint64(pt, scale) {
    const result = new Point64(Math.round(pt.x * scale), Math.round(pt.y * scale));
    return result;
  }
  static scalePath(path, scale) {
    if (InternalClipper.isAlmostZero(scale - 1))
      return path;
    const result = [];
    for (const pt of path)
      result.push({ x: pt.x * scale, y: pt.y * scale });
    return result;
  }
  static scalePaths(paths, scale) {
    if (InternalClipper.isAlmostZero(scale - 1))
      return paths;
    const result = [];
    for (const path of paths)
      result.push(this.scalePath(path, scale));
    return result;
  }
  static translatePath(path, dx, dy) {
    const result = [];
    for (const pt of path) {
      result.push({ x: pt.x + dx, y: pt.y + dy });
    }
    return result;
  }
  static translatePaths(paths, dx, dy) {
    const result = [];
    for (const path of paths) {
      result.push(this.translatePath(path, dx, dy));
    }
    return result;
  }
  static reversePath(path) {
    return [...path].reverse();
  }
  static reversePaths(paths) {
    const result = [];
    for (const t of paths) {
      result.push(this.reversePath(t));
    }
    return result;
  }
  static getBounds(path) {
    const result = Clipper.InvalidRect64;
    for (const pt of path) {
      if (pt.x < result.left)
        result.left = pt.x;
      if (pt.x > result.right)
        result.right = pt.x;
      if (pt.y < result.top)
        result.top = pt.y;
      if (pt.y > result.bottom)
        result.bottom = pt.y;
    }
    return result.left === Number.MAX_SAFE_INTEGER ? new Rect64(0, 0, 0, 0) : result;
  }
  static getBoundsPaths(paths) {
    const result = Clipper.InvalidRect64;
    for (const path of paths) {
      for (const pt of path) {
        if (pt.x < result.left)
          result.left = pt.x;
        if (pt.x > result.right)
          result.right = pt.x;
        if (pt.y < result.top)
          result.top = pt.y;
        if (pt.y > result.bottom)
          result.bottom = pt.y;
      }
    }
    return result.left === Number.MAX_SAFE_INTEGER ? new Rect64(0, 0, 0, 0) : result;
  }
  static makePath(arr) {
    const len = arr.length / 2;
    const p = new Path64();
    for (let i = 0; i < len; i++)
      p.push(new Point64(arr[i * 2], arr[i * 2 + 1]));
    return p;
  }
  static stripDuplicates(path, isClosedPath) {
    const cnt = path.length;
    const result = new Path64();
    if (cnt === 0)
      return result;
    let lastPt = path[0];
    result.push(lastPt);
    for (let i = 1; i < cnt; i++)
      if (lastPt !== path[i]) {
        lastPt = path[i];
        result.push(lastPt);
      }
    if (isClosedPath && lastPt === result[0])
      result.pop();
    return result;
  }
  static addPolyNodeToPaths(polyPath, paths) {
    if (polyPath.polygon && polyPath.polygon.length > 0)
      paths.push(polyPath.polygon);
    for (let i = 0; i < polyPath.count; i++)
      this.addPolyNodeToPaths(polyPath.children[i], paths);
  }
  static polyTreeToPaths64(polyTree) {
    const result = new Paths64();
    for (let i = 0; i < polyTree.count; i++) {
      Clipper.addPolyNodeToPaths(polyTree.children[i], result);
    }
    return result;
  }
  static perpendicDistFromLineSqrd(pt, line1, line2) {
    const a = pt.x - line1.x;
    const b = pt.y - line1.y;
    const c = line2.x - line1.x;
    const d = line2.y - line1.y;
    if (c === 0 && d === 0)
      return 0;
    return Clipper.sqr(a * d - c * b) / (c * c + d * d);
  }
  static rdp(path, begin, end, epsSqrd, flags) {
    let idx = 0;
    let max_d = 0;
    while (end > begin && path[begin] === path[end]) {
      flags[end--] = false;
    }
    for (let i = begin + 1; i < end; i++) {
      const d = Clipper.perpendicDistFromLineSqrd(path[i], path[begin], path[end]);
      if (d <= max_d)
        continue;
      max_d = d;
      idx = i;
    }
    if (max_d <= epsSqrd)
      return;
    flags[idx] = true;
    if (idx > begin + 1)
      Clipper.rdp(path, begin, idx, epsSqrd, flags);
    if (idx < end - 1)
      Clipper.rdp(path, idx, end, epsSqrd, flags);
  }
  static ramerDouglasPeucker(path, epsilon) {
    const len = path.length;
    if (len < 5)
      return path;
    const flags = new Array(len).fill(false);
    flags[0] = true;
    flags[len - 1] = true;
    Clipper.rdp(path, 0, len - 1, Clipper.sqr(epsilon), flags);
    const result = [];
    for (let i = 0; i < len; i++) {
      if (flags[i])
        result.push(path[i]);
    }
    return result;
  }
  static ramerDouglasPeuckerPaths(paths, epsilon) {
    const result = [];
    for (const path of paths) {
      result.push(Clipper.ramerDouglasPeucker(path, epsilon));
    }
    return result;
  }
  static getNext(current, high, flags) {
    current++;
    while (current <= high && flags[current])
      current++;
    if (current <= high)
      return current;
    current = 0;
    while (flags[current])
      current++;
    return current;
  }
  static getPrior(current, high, flags) {
    if (current === 0)
      current = high;
    else
      current--;
    while (current > 0 && flags[current])
      current--;
    if (!flags[current])
      return current;
    current = high;
    while (flags[current])
      current--;
    return current;
  }
  static sqr(value) {
    return value * value;
  }
  static simplifyPath(path, epsilon, isClosedPath = false) {
    const len = path.length;
    const high = len - 1;
    const epsSqr = this.sqr(epsilon);
    if (len < 4)
      return path;
    const flags = new Array(len).fill(false);
    const dsq = new Array(len).fill(0);
    let prev = high;
    let curr = 0;
    let start, next, prior2, next2;
    if (isClosedPath) {
      dsq[0] = this.perpendicDistFromLineSqrd(path[0], path[high], path[1]);
      dsq[high] = this.perpendicDistFromLineSqrd(path[high], path[0], path[high - 1]);
    } else {
      dsq[0] = Number.MAX_VALUE;
      dsq[high] = Number.MAX_VALUE;
    }
    for (let i = 1; i < high; i++) {
      dsq[i] = this.perpendicDistFromLineSqrd(path[i], path[i - 1], path[i + 1]);
    }
    for (; ; ) {
      if (dsq[curr] > epsSqr) {
        start = curr;
        do {
          curr = this.getNext(curr, high, flags);
        } while (curr !== start && dsq[curr] > epsSqr);
        if (curr === start)
          break;
      }
      prev = this.getPrior(curr, high, flags);
      next = this.getNext(curr, high, flags);
      if (next === prev)
        break;
      if (dsq[next] < dsq[curr]) {
        flags[next] = true;
        next = this.getNext(next, high, flags);
        next2 = this.getNext(next, high, flags);
        dsq[curr] = this.perpendicDistFromLineSqrd(path[curr], path[prev], path[next]);
        if (next !== high || isClosedPath) {
          dsq[next] = this.perpendicDistFromLineSqrd(path[next], path[curr], path[next2]);
        }
        curr = next;
      } else {
        flags[curr] = true;
        curr = next;
        next = this.getNext(next, high, flags);
        prior2 = this.getPrior(prev, high, flags);
        dsq[curr] = this.perpendicDistFromLineSqrd(path[curr], path[prev], path[next]);
        if (prev !== 0 || isClosedPath) {
          dsq[prev] = this.perpendicDistFromLineSqrd(path[prev], path[prior2], path[curr]);
        }
      }
    }
    const result = [];
    for (let i = 0; i < len; i++) {
      if (!flags[i])
        result.push(path[i]);
    }
    return result;
  }
  static simplifyPaths(paths, epsilon, isClosedPaths = false) {
    const result = [];
    for (const path of paths) {
      result.push(this.simplifyPath(path, epsilon, isClosedPaths));
    }
    return result;
  }
  //private static getNext(current: number, high: number, flags: boolean[]): number {
  //  current++;
  //  while (current <= high && flags[current]) current++;
  //  return current;
  //}
  //private static getPrior(current: number, high: number, flags: boolean[]): number {
  //  if (current === 0) return high;
  //  current--;
  //  while (current > 0 && flags[current]) current--;
  //  return current;
  //}
  static trimCollinear(path, isOpen = false) {
    let len = path.length;
    let i = 0;
    if (!isOpen) {
      while (i < len - 1 && InternalClipper.crossProduct(path[len - 1], path[i], path[i + 1]) === 0)
        i++;
      while (i < len - 1 && InternalClipper.crossProduct(path[len - 2], path[len - 1], path[i]) === 0)
        len--;
    }
    if (len - i < 3) {
      if (!isOpen || len < 2 || path[0] === path[1]) {
        return [];
      }
      return path;
    }
    const result = [];
    let last = path[i];
    result.push(last);
    for (i++; i < len - 1; i++) {
      if (InternalClipper.crossProduct(last, path[i], path[i + 1]) === 0)
        continue;
      last = path[i];
      result.push(last);
    }
    if (isOpen) {
      result.push(path[len - 1]);
    } else if (InternalClipper.crossProduct(last, path[len - 1], result[0]) !== 0) {
      result.push(path[len - 1]);
    } else {
      while (result.length > 2 && InternalClipper.crossProduct(result[result.length - 1], result[result.length - 2], result[0]) === 0) {
        result.pop();
      }
      if (result.length < 3)
        result.splice(0, result.length);
    }
    return result;
  }
  static pointInPolygon(pt, polygon) {
    return InternalClipper.pointInPolygon(pt, polygon);
  }
  static ellipse(center, radiusX, radiusY = 0, steps = 0) {
    if (radiusX <= 0)
      return [];
    if (radiusY <= 0)
      radiusY = radiusX;
    if (steps <= 2)
      steps = Math.ceil(Math.PI * Math.sqrt((radiusX + radiusY) / 2));
    const si = Math.sin(2 * Math.PI / steps);
    const co = Math.cos(2 * Math.PI / steps);
    let dx = co, dy = si;
    const result = [{ x: center.x + radiusX, y: center.y }];
    for (let i = 1; i < steps; ++i) {
      result.push({ x: center.x + radiusX * dx, y: center.y + radiusY * dy });
      const x = dx * co - dy * si;
      dy = dy * co + dx * si;
      dx = x;
    }
    return result;
  }
  static showPolyPathStructure(pp, level) {
    const spaces = " ".repeat(level * 2);
    const caption = pp.isHole ? "Hole " : "Outer ";
    if (pp.count === 0) {
      console.log(spaces + caption);
    } else {
      console.log(spaces + caption + `(${pp.count})`);
      pp.forEach((child) => this.showPolyPathStructure(child, level + 1));
    }
  }
  static showPolyTreeStructure(polytree) {
    console.log("Polytree Root");
    polytree.forEach((child) => this.showPolyPathStructure(child, 1));
  }
}
var PointInPolygonResult;
(function(PointInPolygonResult2) {
  PointInPolygonResult2[PointInPolygonResult2["IsOn"] = 0] = "IsOn";
  PointInPolygonResult2[PointInPolygonResult2["IsInside"] = 1] = "IsInside";
  PointInPolygonResult2[PointInPolygonResult2["IsOutside"] = 2] = "IsOutside";
})(PointInPolygonResult || (PointInPolygonResult = {}));
var VertexFlags;
(function(VertexFlags2) {
  VertexFlags2[VertexFlags2["None"] = 0] = "None";
  VertexFlags2[VertexFlags2["OpenStart"] = 1] = "OpenStart";
  VertexFlags2[VertexFlags2["OpenEnd"] = 2] = "OpenEnd";
  VertexFlags2[VertexFlags2["LocalMax"] = 4] = "LocalMax";
  VertexFlags2[VertexFlags2["LocalMin"] = 8] = "LocalMin";
})(VertexFlags || (VertexFlags = {}));
class Vertex {
  constructor(pt, flags, prev) {
    this.pt = pt;
    this.flags = flags;
    this.next = void 0;
    this.prev = prev;
  }
}
class LocalMinima {
  constructor(vertex, polytype, isOpen = false) {
    this.vertex = vertex;
    this.polytype = polytype;
    this.isOpen = isOpen;
  }
  static equals(lm1, lm2) {
    return lm1.vertex === lm2.vertex;
  }
  static notEquals(lm1, lm2) {
    return lm1.vertex !== lm2.vertex;
  }
}
class IntersectNode {
  constructor(pt, edge1, edge2) {
    this.pt = pt;
    this.edge1 = edge1;
    this.edge2 = edge2;
  }
}
class OutPt {
  constructor(pt, outrec) {
    this.pt = pt;
    this.outrec = outrec;
    this.next = this;
    this.prev = this;
    this.horz = void 0;
  }
}
var JoinWith;
(function(JoinWith2) {
  JoinWith2[JoinWith2["None"] = 0] = "None";
  JoinWith2[JoinWith2["Left"] = 1] = "Left";
  JoinWith2[JoinWith2["Right"] = 2] = "Right";
})(JoinWith || (JoinWith = {}));
var HorzPosition;
(function(HorzPosition2) {
  HorzPosition2[HorzPosition2["Bottom"] = 0] = "Bottom";
  HorzPosition2[HorzPosition2["Middle"] = 1] = "Middle";
  HorzPosition2[HorzPosition2["Top"] = 2] = "Top";
})(HorzPosition || (HorzPosition = {}));
class OutRec {
  constructor(idx) {
    this.idx = idx;
    this.isOpen = false;
  }
}
class HorzSegment {
  constructor(op) {
    this.leftOp = op;
    this.rightOp = void 0;
    this.leftToRight = true;
  }
}
class HorzJoin {
  constructor(ltor, rtol) {
    this.op1 = ltor;
    this.op2 = rtol;
  }
}
class Active {
  constructor() {
    this.dx = this.windCount = this.windCount2 = 0;
    this.isLeftBound = false;
    this.joinWith = JoinWith.None;
  }
}
class ClipperEngine {
  static addLocMin(vert, polytype, isOpen, minimaList) {
    if ((vert.flags & VertexFlags.LocalMin) !== VertexFlags.None)
      return;
    vert.flags |= VertexFlags.LocalMin;
    const lm = new LocalMinima(vert, polytype, isOpen);
    minimaList.push(lm);
  }
  static addPathsToVertexList(paths, polytype, isOpen, minimaList, vertexList) {
    let totalVertCnt = 0;
    for (const path of paths)
      totalVertCnt += path.length;
    for (const path of paths) {
      let v0 = void 0;
      let prev_v = void 0;
      let curr_v = void 0;
      for (const pt of path) {
        if (!v0) {
          v0 = new Vertex(pt, VertexFlags.None, void 0);
          vertexList.push(v0);
          prev_v = v0;
        } else if (prev_v.pt !== pt) {
          curr_v = new Vertex(pt, VertexFlags.None, prev_v);
          vertexList.push(curr_v);
          prev_v.next = curr_v;
          prev_v = curr_v;
        }
      }
      if (!prev_v || !prev_v.prev)
        continue;
      if (!isOpen && prev_v.pt === v0.pt)
        prev_v = prev_v.prev;
      prev_v.next = v0;
      v0.prev = prev_v;
      if (!isOpen && prev_v.next === prev_v)
        continue;
      let going_up = false;
      if (isOpen) {
        curr_v = v0.next;
        let count2 = 0;
        while (curr_v !== v0 && curr_v.pt.y === v0.pt.y) {
          curr_v = curr_v.next;
          if (count2++ > totalVertCnt) {
            console.warn("infinite loop detected");
            break;
          }
        }
        going_up = curr_v.pt.y <= v0.pt.y;
        if (going_up) {
          v0.flags = VertexFlags.OpenStart;
          this.addLocMin(v0, polytype, true, minimaList);
        } else {
          v0.flags = VertexFlags.OpenStart | VertexFlags.LocalMax;
        }
      } else {
        prev_v = v0.prev;
        let count2 = 0;
        while (prev_v !== v0 && prev_v.pt.y === v0.pt.y) {
          prev_v = prev_v.prev;
          if (count2++ > totalVertCnt) {
            console.warn("infinite loop detected");
            break;
          }
        }
        if (prev_v === v0) {
          continue;
        }
        going_up = prev_v.pt.y > v0.pt.y;
      }
      const going_up0 = going_up;
      prev_v = v0;
      curr_v = v0.next;
      let count = 0;
      while (curr_v !== v0) {
        if (curr_v.pt.y > prev_v.pt.y && going_up) {
          prev_v.flags |= VertexFlags.LocalMax;
          going_up = false;
        } else if (curr_v.pt.y < prev_v.pt.y && !going_up) {
          going_up = true;
          this.addLocMin(prev_v, polytype, isOpen, minimaList);
        }
        prev_v = curr_v;
        curr_v = curr_v.next;
        if (count++ > totalVertCnt) {
          console.warn("infinite loop detected");
          break;
        }
      }
      if (isOpen) {
        prev_v.flags |= VertexFlags.OpenEnd;
        if (going_up) {
          prev_v.flags |= VertexFlags.LocalMax;
        } else {
          this.addLocMin(prev_v, polytype, isOpen, minimaList);
        }
      } else if (going_up !== going_up0) {
        if (going_up0) {
          this.addLocMin(prev_v, polytype, false, minimaList);
        } else {
          prev_v.flags |= VertexFlags.LocalMax;
        }
      }
    }
  }
}
class SimpleNavigableSet {
  constructor() {
    this.items = [];
    this.items = [];
  }
  clear() {
    this.items.length = 0;
  }
  isEmpty() {
    return this.items.length == 0;
  }
  pollLast() {
    return this.items.pop();
  }
  add(item) {
    if (!this.items.includes(item)) {
      this.items.push(item);
      this.items.sort((a, b) => a - b);
    }
  }
}
class ClipperBase {
  constructor() {
    this._cliptype = ClipType.None;
    this._fillrule = FillRule.EvenOdd;
    this._currentLocMin = 0;
    this._currentBotY = 0;
    this._isSortedMinimaList = false;
    this._hasOpenPaths = false;
    this._using_polytree = false;
    this._succeeded = false;
    this.reverseSolution = false;
    this._minimaList = [];
    this._intersectList = [];
    this._vertexList = [];
    this._outrecList = [];
    this._scanlineList = new SimpleNavigableSet();
    this._horzSegList = [];
    this._horzJoinList = [];
    this.preserveCollinear = true;
  }
  static isOdd(val) {
    return (val & 1) !== 0;
  }
  static isHotEdgeActive(ae) {
    return ae.outrec !== void 0;
  }
  static isOpen(ae) {
    return ae.localMin.isOpen;
  }
  static isOpenEndActive(ae) {
    return ae.localMin.isOpen && ClipperBase.isOpenEnd(ae.vertexTop);
  }
  static isOpenEnd(v) {
    return (v.flags & (VertexFlags.OpenStart | VertexFlags.OpenEnd)) !== VertexFlags.None;
  }
  static getPrevHotEdge(ae) {
    let prev = ae.prevInAEL;
    while (prev && (ClipperBase.isOpen(prev) || !ClipperBase.isHotEdgeActive(prev)))
      prev = prev.prevInAEL;
    return prev;
  }
  static isFront(ae) {
    return ae === ae.outrec.frontEdge;
  }
  /*******************************************************************************
  *  Dx:                             0(90deg)                                    *
  *                                  |                                           *
  *               +inf (180deg) <--- o --. -inf (0deg)                          *
  *******************************************************************************/
  static getDx(pt1, pt2) {
    const dy = pt2.y - pt1.y;
    if (dy !== 0)
      return (pt2.x - pt1.x) / dy;
    if (pt2.x > pt1.x)
      return Number.NEGATIVE_INFINITY;
    return Number.POSITIVE_INFINITY;
  }
  static topX(ae, currentY) {
    if (currentY === ae.top.y || ae.top.x === ae.bot.x)
      return ae.top.x;
    if (currentY === ae.bot.y)
      return ae.bot.x;
    return ae.bot.x + Math.round(ae.dx * (currentY - ae.bot.y));
  }
  static isHorizontal(ae) {
    return ae.top.y === ae.bot.y;
  }
  static isHeadingRightHorz(ae) {
    return Number.NEGATIVE_INFINITY === ae.dx;
  }
  static isHeadingLeftHorz(ae) {
    return Number.POSITIVE_INFINITY === ae.dx;
  }
  static swapActives(ae1, ae2) {
  }
  static getPolyType(ae) {
    return ae.localMin.polytype;
  }
  static isSamePolyType(ae1, ae2) {
    return ae1.localMin.polytype === ae2.localMin.polytype;
  }
  static setDx(ae) {
    ae.dx = ClipperBase.getDx(ae.bot, ae.top);
  }
  static nextVertex(ae) {
    if (ae.windDx > 0)
      return ae.vertexTop.next;
    return ae.vertexTop.prev;
  }
  static prevPrevVertex(ae) {
    if (ae.windDx > 0)
      return ae.vertexTop.prev.prev;
    return ae.vertexTop.next.next;
  }
  static isMaxima(vertex) {
    return (vertex.flags & VertexFlags.LocalMax) !== VertexFlags.None;
  }
  static isMaximaActive(ae) {
    return ClipperBase.isMaxima(ae.vertexTop);
  }
  static getMaximaPair(ae) {
    let ae2 = ae.nextInAEL;
    while (ae2) {
      if (ae2.vertexTop === ae.vertexTop)
        return ae2;
      ae2 = ae2.nextInAEL;
    }
    return void 0;
  }
  static getCurrYMaximaVertex_Open(ae) {
    let result = ae.vertexTop;
    if (ae.windDx > 0) {
      while (result.next.pt.y === result.pt.y && (result.flags & (VertexFlags.OpenEnd | VertexFlags.LocalMax)) === VertexFlags.None)
        result = result.next;
    } else {
      while (result.prev.pt.y === result.pt.y && (result.flags & (VertexFlags.OpenEnd | VertexFlags.LocalMax)) === VertexFlags.None)
        result = result.prev;
    }
    if (!ClipperBase.isMaxima(result))
      result = void 0;
    return result;
  }
  static getCurrYMaximaVertex(ae) {
    let result = ae.vertexTop;
    if (ae.windDx > 0) {
      while (result.next.pt.y === result.pt.y)
        result = result.next;
    } else {
      while (result.prev.pt.y === result.pt.y)
        result = result.prev;
    }
    if (!ClipperBase.isMaxima(result))
      result = void 0;
    return result;
  }
  static setSides(outrec, startEdge, endEdge) {
    outrec.frontEdge = startEdge;
    outrec.backEdge = endEdge;
  }
  static swapOutrecs(ae1, ae2) {
    const or1 = ae1.outrec;
    const or2 = ae2.outrec;
    if (or1 === or2) {
      const ae = or1.frontEdge;
      or1.frontEdge = or1.backEdge;
      or1.backEdge = ae;
      return;
    }
    if (or1) {
      if (ae1 === or1.frontEdge)
        or1.frontEdge = ae2;
      else
        or1.backEdge = ae2;
    }
    if (or2) {
      if (ae2 === or2.frontEdge)
        or2.frontEdge = ae1;
      else
        or2.backEdge = ae1;
    }
    ae1.outrec = or2;
    ae2.outrec = or1;
  }
  static setOwner(outrec, newOwner) {
    while (newOwner.owner && !newOwner.owner.pts) {
      newOwner.owner = newOwner.owner.owner;
    }
    let tmp = newOwner;
    while (tmp && tmp !== outrec)
      tmp = tmp.owner;
    if (tmp)
      newOwner.owner = outrec.owner;
    outrec.owner = newOwner;
  }
  static area(op) {
    let area = 0;
    let op2 = op;
    do {
      area += (op2.prev.pt.y + op2.pt.y) * (op2.prev.pt.x - op2.pt.x);
      op2 = op2.next;
    } while (op2 !== op);
    return area * 0.5;
  }
  static areaTriangle(pt1, pt2, pt3) {
    return (pt3.y + pt1.y) * (pt3.x - pt1.x) + (pt1.y + pt2.y) * (pt1.x - pt2.x) + (pt2.y + pt3.y) * (pt2.x - pt3.x);
  }
  static getRealOutRec(outRec) {
    while (outRec !== void 0 && outRec.pts === void 0) {
      outRec = outRec.owner;
    }
    return outRec;
  }
  static isValidOwner(outRec, testOwner) {
    while (testOwner !== void 0 && testOwner !== outRec)
      testOwner = testOwner.owner;
    return testOwner === void 0;
  }
  static uncoupleOutRec(ae) {
    const outrec = ae.outrec;
    if (outrec === void 0)
      return;
    outrec.frontEdge.outrec = void 0;
    outrec.backEdge.outrec = void 0;
    outrec.frontEdge = void 0;
    outrec.backEdge = void 0;
  }
  static outrecIsAscending(hotEdge) {
    return hotEdge === hotEdge.outrec.frontEdge;
  }
  static swapFrontBackSides(outrec) {
    const ae2 = outrec.frontEdge;
    outrec.frontEdge = outrec.backEdge;
    outrec.backEdge = ae2;
    outrec.pts = outrec.pts.next;
  }
  static edgesAdjacentInAEL(inode) {
    return inode.edge1.nextInAEL === inode.edge2 || inode.edge1.prevInAEL === inode.edge2;
  }
  clearSolutionOnly() {
    while (this._actives)
      this.deleteFromAEL(this._actives);
    this._scanlineList.clear();
    this.disposeIntersectNodes();
    this._outrecList.length = 0;
    this._horzSegList.length = 0;
    this._horzJoinList.length = 0;
  }
  clear() {
    this.clearSolutionOnly();
    this._minimaList.length = 0;
    this._vertexList.length = 0;
    this._currentLocMin = 0;
    this._isSortedMinimaList = false;
    this._hasOpenPaths = false;
  }
  reset() {
    if (!this._isSortedMinimaList) {
      this._minimaList.sort((locMin1, locMin2) => locMin2.vertex.pt.y - locMin1.vertex.pt.y);
      this._isSortedMinimaList = true;
    }
    for (let i = this._minimaList.length - 1; i >= 0; i--) {
      this._scanlineList.add(this._minimaList[i].vertex.pt.y);
    }
    this._currentBotY = 0;
    this._currentLocMin = 0;
    this._actives = void 0;
    this._sel = void 0;
    this._succeeded = true;
  }
  insertScanline(y) {
    this._scanlineList.add(y);
  }
  popScanline() {
    return this._scanlineList.pollLast();
  }
  hasLocMinAtY(y) {
    return this._currentLocMin < this._minimaList.length && this._minimaList[this._currentLocMin].vertex.pt.y == y;
  }
  popLocalMinima() {
    return this._minimaList[this._currentLocMin++];
  }
  addLocMin(vert, polytype, isOpen) {
    if ((vert.flags & VertexFlags.LocalMin) != VertexFlags.None)
      return;
    vert.flags |= VertexFlags.LocalMin;
    const lm = new LocalMinima(vert, polytype, isOpen);
    this._minimaList.push(lm);
  }
  addSubject(path) {
    this.addPath(path, PathType.Subject);
  }
  addOpenSubject(path) {
    this.addPath(path, PathType.Subject, true);
  }
  addClip(path) {
    this.addPath(path, PathType.Clip);
  }
  addPath(path, polytype, isOpen = false) {
    const tmp = [path];
    this.addPaths(tmp, polytype, isOpen);
  }
  addPaths(paths, polytype, isOpen = false) {
    if (isOpen)
      this._hasOpenPaths = true;
    this._isSortedMinimaList = false;
    ClipperEngine.addPathsToVertexList(paths, polytype, isOpen, this._minimaList, this._vertexList);
  }
  addReuseableData(reuseableData) {
    if (reuseableData._minimaList.length === 0)
      return;
    this._isSortedMinimaList = false;
    for (const lm of reuseableData._minimaList) {
      this._minimaList.push(new LocalMinima(lm.vertex, lm.polytype, lm.isOpen));
      if (lm.isOpen)
        this._hasOpenPaths = true;
    }
  }
  isContributingClosed(ae) {
    switch (this._fillrule) {
      case FillRule.Positive:
        if (ae.windCount !== 1)
          return false;
        break;
      case FillRule.Negative:
        if (ae.windCount !== -1)
          return false;
        break;
      case FillRule.NonZero:
        if (Math.abs(ae.windCount) !== 1)
          return false;
        break;
    }
    switch (this._cliptype) {
      case ClipType.Intersection:
        switch (this._fillrule) {
          case FillRule.Positive:
            return ae.windCount2 > 0;
          case FillRule.Negative:
            return ae.windCount2 < 0;
          default:
            return ae.windCount2 !== 0;
        }
      case ClipType.Union:
        switch (this._fillrule) {
          case FillRule.Positive:
            return ae.windCount2 <= 0;
          case FillRule.Negative:
            return ae.windCount2 >= 0;
          default:
            return ae.windCount2 === 0;
        }
      case ClipType.Difference:
        const result = this._fillrule === FillRule.Positive ? ae.windCount2 <= 0 : this._fillrule === FillRule.Negative ? ae.windCount2 >= 0 : ae.windCount2 === 0;
        return ClipperBase.getPolyType(ae) === PathType.Subject ? result : !result;
      case ClipType.Xor:
        return true;
      default:
        return false;
    }
  }
  isContributingOpen(ae) {
    let isInClip, isInSubj;
    switch (this._fillrule) {
      case FillRule.Positive:
        isInSubj = ae.windCount > 0;
        isInClip = ae.windCount2 > 0;
        break;
      case FillRule.Negative:
        isInSubj = ae.windCount < 0;
        isInClip = ae.windCount2 < 0;
        break;
      default:
        isInSubj = ae.windCount !== 0;
        isInClip = ae.windCount2 !== 0;
        break;
    }
    switch (this._cliptype) {
      case ClipType.Intersection:
        return isInClip;
      case ClipType.Union:
        return !isInSubj && !isInClip;
      default:
        return !isInClip;
    }
  }
  setWindCountForClosedPathEdge(ae) {
    let ae2 = ae.prevInAEL;
    const pt = ClipperBase.getPolyType(ae);
    while (ae2 !== void 0 && (ClipperBase.getPolyType(ae2) !== pt || ClipperBase.isOpen(ae2))) {
      ae2 = ae2.prevInAEL;
    }
    if (ae2 === void 0) {
      ae.windCount = ae.windDx;
      ae2 = this._actives;
    } else if (this._fillrule === FillRule.EvenOdd) {
      ae.windCount = ae.windDx;
      ae.windCount2 = ae2.windCount2;
      ae2 = ae2.nextInAEL;
    } else {
      if (ae2.windCount * ae2.windDx < 0) {
        if (Math.abs(ae2.windCount) > 1) {
          if (ae2.windDx * ae.windDx < 0)
            ae.windCount = ae2.windCount;
          else
            ae.windCount = ae2.windCount + ae.windDx;
        } else {
          ae.windCount = ClipperBase.isOpen(ae) ? 1 : ae.windDx;
        }
      } else {
        if (ae2.windDx * ae.windDx < 0)
          ae.windCount = ae2.windCount;
        else
          ae.windCount = ae2.windCount + ae.windDx;
      }
      ae.windCount2 = ae2.windCount2;
      ae2 = ae2.nextInAEL;
    }
    if (this._fillrule === FillRule.EvenOdd) {
      while (ae2 !== ae) {
        if (ClipperBase.getPolyType(ae2) !== pt && !ClipperBase.isOpen(ae2)) {
          ae.windCount2 = ae.windCount2 === 0 ? 1 : 0;
        }
        ae2 = ae2.nextInAEL;
      }
    } else {
      while (ae2 !== ae) {
        if (ClipperBase.getPolyType(ae2) !== pt && !ClipperBase.isOpen(ae2)) {
          ae.windCount2 += ae2.windDx;
        }
        ae2 = ae2.nextInAEL;
      }
    }
  }
  setWindCountForOpenPathEdge(ae) {
    let ae2 = this._actives;
    if (this._fillrule === FillRule.EvenOdd) {
      let cnt1 = 0, cnt2 = 0;
      while (ae2 !== ae) {
        if (ClipperBase.getPolyType(ae2) === PathType.Clip)
          cnt2++;
        else if (!ClipperBase.isOpen(ae2))
          cnt1++;
        ae2 = ae2.nextInAEL;
      }
      ae.windCount = ClipperBase.isOdd(cnt1) ? 1 : 0;
      ae.windCount2 = ClipperBase.isOdd(cnt2) ? 1 : 0;
    } else {
      while (ae2 !== ae) {
        if (ClipperBase.getPolyType(ae2) === PathType.Clip)
          ae.windCount2 += ae2.windDx;
        else if (!ClipperBase.isOpen(ae2))
          ae.windCount += ae2.windDx;
        ae2 = ae2.nextInAEL;
      }
    }
  }
  static isValidAelOrder(resident, newcomer) {
    if (newcomer.curX !== resident.curX)
      return newcomer.curX > resident.curX;
    const d = InternalClipper.crossProduct(resident.top, newcomer.bot, newcomer.top);
    if (d !== 0)
      return d < 0;
    if (!this.isMaximaActive(resident) && resident.top.y > newcomer.top.y) {
      return InternalClipper.crossProduct(newcomer.bot, resident.top, this.nextVertex(resident).pt) <= 0;
    }
    if (!this.isMaximaActive(newcomer) && newcomer.top.y > resident.top.y) {
      return InternalClipper.crossProduct(newcomer.bot, newcomer.top, this.nextVertex(newcomer).pt) >= 0;
    }
    const y = newcomer.bot.y;
    const newcomerIsLeft = newcomer.isLeftBound;
    if (resident.bot.y !== y || resident.localMin.vertex.pt.y !== y)
      return newcomer.isLeftBound;
    if (resident.isLeftBound !== newcomerIsLeft)
      return newcomerIsLeft;
    if (InternalClipper.crossProduct(this.prevPrevVertex(resident).pt, resident.bot, resident.top) === 0)
      return true;
    return InternalClipper.crossProduct(this.prevPrevVertex(resident).pt, newcomer.bot, this.prevPrevVertex(newcomer).pt) > 0 === newcomerIsLeft;
  }
  insertLeftEdge(ae) {
    let ae2;
    if (!this._actives) {
      ae.prevInAEL = void 0;
      ae.nextInAEL = void 0;
      this._actives = ae;
    } else if (!ClipperBase.isValidAelOrder(this._actives, ae)) {
      ae.prevInAEL = void 0;
      ae.nextInAEL = this._actives;
      this._actives.prevInAEL = ae;
      this._actives = ae;
    } else {
      ae2 = this._actives;
      while (ae2.nextInAEL && ClipperBase.isValidAelOrder(ae2.nextInAEL, ae))
        ae2 = ae2.nextInAEL;
      if (ae2.joinWith === JoinWith.Right)
        ae2 = ae2.nextInAEL;
      ae.nextInAEL = ae2.nextInAEL;
      if (ae2.nextInAEL)
        ae2.nextInAEL.prevInAEL = ae;
      ae.prevInAEL = ae2;
      ae2.nextInAEL = ae;
    }
  }
  static insertRightEdge(ae, ae2) {
    ae2.nextInAEL = ae.nextInAEL;
    if (ae.nextInAEL)
      ae.nextInAEL.prevInAEL = ae2;
    ae2.prevInAEL = ae;
    ae.nextInAEL = ae2;
  }
  insertLocalMinimaIntoAEL(botY) {
    let localMinima;
    let leftBound;
    let rightBound;
    while (this.hasLocMinAtY(botY)) {
      localMinima = this.popLocalMinima();
      if ((localMinima.vertex.flags & VertexFlags.OpenStart) !== VertexFlags.None) {
        leftBound = void 0;
      } else {
        leftBound = new Active();
        leftBound.bot = localMinima.vertex.pt;
        leftBound.curX = localMinima.vertex.pt.x;
        leftBound.windDx = -1;
        leftBound.vertexTop = localMinima.vertex.prev;
        leftBound.top = localMinima.vertex.prev.pt;
        leftBound.outrec = void 0;
        leftBound.localMin = localMinima;
        ClipperBase.setDx(leftBound);
      }
      if ((localMinima.vertex.flags & VertexFlags.OpenEnd) !== VertexFlags.None) {
        rightBound = void 0;
      } else {
        rightBound = new Active();
        rightBound.bot = localMinima.vertex.pt;
        rightBound.curX = localMinima.vertex.pt.x;
        rightBound.windDx = 1;
        rightBound.vertexTop = localMinima.vertex.next;
        rightBound.top = localMinima.vertex.next.pt;
        rightBound.outrec = void 0;
        rightBound.localMin = localMinima;
        ClipperBase.setDx(rightBound);
      }
      if (leftBound && rightBound) {
        if (ClipperBase.isHorizontal(leftBound)) {
          if (ClipperBase.isHeadingRightHorz(leftBound)) {
            [rightBound, leftBound] = [leftBound, rightBound];
          }
        } else if (ClipperBase.isHorizontal(rightBound)) {
          if (ClipperBase.isHeadingLeftHorz(rightBound)) {
            [rightBound, leftBound] = [leftBound, rightBound];
          }
        } else if (leftBound.dx < rightBound.dx) {
          [rightBound, leftBound] = [leftBound, rightBound];
        }
      } else if (leftBound === void 0) {
        leftBound = rightBound;
        rightBound = void 0;
      }
      let contributing = false;
      leftBound.isLeftBound = true;
      this.insertLeftEdge(leftBound);
      if (ClipperBase.isOpen(leftBound)) {
        this.setWindCountForOpenPathEdge(leftBound);
        contributing = this.isContributingOpen(leftBound);
      } else {
        this.setWindCountForClosedPathEdge(leftBound);
        contributing = this.isContributingClosed(leftBound);
      }
      if (rightBound) {
        rightBound.windCount = leftBound.windCount;
        rightBound.windCount2 = leftBound.windCount2;
        ClipperBase.insertRightEdge(leftBound, rightBound);
        if (contributing) {
          this.addLocalMinPoly(leftBound, rightBound, leftBound.bot, true);
          if (!ClipperBase.isHorizontal(leftBound)) {
            this.checkJoinLeft(leftBound, leftBound.bot);
          }
        }
        while (rightBound.nextInAEL && ClipperBase.isValidAelOrder(rightBound.nextInAEL, rightBound)) {
          this.intersectEdges(rightBound, rightBound.nextInAEL, rightBound.bot);
          this.swapPositionsInAEL(rightBound, rightBound.nextInAEL);
        }
        if (ClipperBase.isHorizontal(rightBound)) {
          this.pushHorz(rightBound);
        } else {
          this.checkJoinRight(rightBound, rightBound.bot);
          this.insertScanline(rightBound.top.y);
        }
      } else if (contributing) {
        this.startOpenPath(leftBound, leftBound.bot);
      }
      if (ClipperBase.isHorizontal(leftBound)) {
        this.pushHorz(leftBound);
      } else {
        this.insertScanline(leftBound.top.y);
      }
    }
  }
  pushHorz(ae) {
    ae.nextInSEL = this._sel;
    this._sel = ae;
  }
  popHorz() {
    const ae = this._sel;
    if (this._sel === void 0)
      return void 0;
    this._sel = this._sel.nextInSEL;
    return ae;
  }
  addLocalMinPoly(ae1, ae2, pt, isNew = false) {
    const outrec = this.newOutRec();
    ae1.outrec = outrec;
    ae2.outrec = outrec;
    if (ClipperBase.isOpen(ae1)) {
      outrec.owner = void 0;
      outrec.isOpen = true;
      if (ae1.windDx > 0)
        ClipperBase.setSides(outrec, ae1, ae2);
      else
        ClipperBase.setSides(outrec, ae2, ae1);
    } else {
      outrec.isOpen = false;
      const prevHotEdge = ClipperBase.getPrevHotEdge(ae1);
      if (prevHotEdge) {
        if (this._using_polytree)
          ClipperBase.setOwner(outrec, prevHotEdge.outrec);
        outrec.owner = prevHotEdge.outrec;
        if (ClipperBase.outrecIsAscending(prevHotEdge) === isNew)
          ClipperBase.setSides(outrec, ae2, ae1);
        else
          ClipperBase.setSides(outrec, ae1, ae2);
      } else {
        outrec.owner = void 0;
        if (isNew)
          ClipperBase.setSides(outrec, ae1, ae2);
        else
          ClipperBase.setSides(outrec, ae2, ae1);
      }
    }
    const op = new OutPt(pt, outrec);
    outrec.pts = op;
    return op;
  }
  addLocalMaxPoly(ae1, ae2, pt) {
    if (ClipperBase.isJoined(ae1))
      this.split(ae1, pt);
    if (ClipperBase.isJoined(ae2))
      this.split(ae2, pt);
    if (ClipperBase.isFront(ae1) === ClipperBase.isFront(ae2)) {
      if (ClipperBase.isOpenEndActive(ae1))
        ClipperBase.swapFrontBackSides(ae1.outrec);
      else if (ClipperBase.isOpenEndActive(ae2))
        ClipperBase.swapFrontBackSides(ae2.outrec);
      else {
        this._succeeded = false;
        return void 0;
      }
    }
    const result = ClipperBase.addOutPt(ae1, pt);
    if (ae1.outrec === ae2.outrec) {
      const outrec = ae1.outrec;
      outrec.pts = result;
      if (this._using_polytree) {
        const e = ClipperBase.getPrevHotEdge(ae1);
        if (e === void 0)
          outrec.owner = void 0;
        else
          ClipperBase.setOwner(outrec, e.outrec);
      }
      ClipperBase.uncoupleOutRec(ae1);
    } else if (ClipperBase.isOpen(ae1)) {
      if (ae1.windDx < 0)
        ClipperBase.joinOutrecPaths(ae1, ae2);
      else
        ClipperBase.joinOutrecPaths(ae2, ae1);
    } else if (ae1.outrec.idx < ae2.outrec.idx)
      ClipperBase.joinOutrecPaths(ae1, ae2);
    else
      ClipperBase.joinOutrecPaths(ae2, ae1);
    return result;
  }
  static joinOutrecPaths(ae1, ae2) {
    const p1Start = ae1.outrec.pts;
    const p2Start = ae2.outrec.pts;
    const p1End = p1Start.next;
    const p2End = p2Start.next;
    if (ClipperBase.isFront(ae1)) {
      p2End.prev = p1Start;
      p1Start.next = p2End;
      p2Start.next = p1End;
      p1End.prev = p2Start;
      ae1.outrec.pts = p2Start;
      ae1.outrec.frontEdge = ae2.outrec.frontEdge;
      if (ae1.outrec.frontEdge)
        ae1.outrec.frontEdge.outrec = ae1.outrec;
    } else {
      p1End.prev = p2Start;
      p2Start.next = p1End;
      p1Start.next = p2End;
      p2End.prev = p1Start;
      ae1.outrec.backEdge = ae2.outrec.backEdge;
      if (ae1.outrec.backEdge)
        ae1.outrec.backEdge.outrec = ae1.outrec;
    }
    ae2.outrec.frontEdge = void 0;
    ae2.outrec.backEdge = void 0;
    ae2.outrec.pts = void 0;
    ClipperBase.setOwner(ae2.outrec, ae1.outrec);
    if (ClipperBase.isOpenEndActive(ae1)) {
      ae2.outrec.pts = ae1.outrec.pts;
      ae1.outrec.pts = void 0;
    }
    ae1.outrec = void 0;
    ae2.outrec = void 0;
  }
  static addOutPt(ae, pt) {
    const outrec = ae.outrec;
    const toFront = ClipperBase.isFront(ae);
    const opFront = outrec.pts;
    const opBack = opFront.next;
    if (toFront && pt == opFront.pt)
      return opFront;
    else if (!toFront && pt == opBack.pt)
      return opBack;
    const newOp = new OutPt(pt, outrec);
    opBack.prev = newOp;
    newOp.prev = opFront;
    newOp.next = opBack;
    opFront.next = newOp;
    if (toFront)
      outrec.pts = newOp;
    return newOp;
  }
  newOutRec() {
    const result = new OutRec(this._outrecList.length);
    this._outrecList.push(result);
    return result;
  }
  startOpenPath(ae, pt) {
    const outrec = this.newOutRec();
    outrec.isOpen = true;
    if (ae.windDx > 0) {
      outrec.frontEdge = ae;
      outrec.backEdge = void 0;
    } else {
      outrec.frontEdge = void 0;
      outrec.backEdge = ae;
    }
    ae.outrec = outrec;
    const op = new OutPt(pt, outrec);
    outrec.pts = op;
    return op;
  }
  updateEdgeIntoAEL(ae) {
    ae.bot = ae.top;
    ae.vertexTop = ClipperBase.nextVertex(ae);
    ae.top = ae.vertexTop.pt;
    ae.curX = ae.bot.x;
    ClipperBase.setDx(ae);
    if (ClipperBase.isJoined(ae))
      this.split(ae, ae.bot);
    if (ClipperBase.isHorizontal(ae))
      return;
    this.insertScanline(ae.top.y);
    this.checkJoinLeft(ae, ae.bot);
    this.checkJoinRight(ae, ae.bot, true);
  }
  static findEdgeWithMatchingLocMin(e) {
    let result = e.nextInAEL;
    while (result) {
      if (result.localMin === e.localMin)
        return result;
      if (!ClipperBase.isHorizontal(result) && e.bot !== result.bot)
        result = void 0;
      else
        result = result.nextInAEL;
    }
    result = e.prevInAEL;
    while (result) {
      if (result.localMin === e.localMin)
        return result;
      if (!ClipperBase.isHorizontal(result) && e.bot !== result.bot)
        return void 0;
      result = result.prevInAEL;
    }
    return result;
  }
  intersectEdges(ae1, ae2, pt) {
    let resultOp = void 0;
    if (this._hasOpenPaths && (ClipperBase.isOpen(ae1) || ClipperBase.isOpen(ae2))) {
      if (ClipperBase.isOpen(ae1) && ClipperBase.isOpen(ae2))
        return void 0;
      if (ClipperBase.isOpen(ae2))
        ClipperBase.swapActives(ae1, ae2);
      if (ClipperBase.isJoined(ae2))
        this.split(ae2, pt);
      if (this._cliptype === ClipType.Union) {
        if (!ClipperBase.isHotEdgeActive(ae2))
          return void 0;
      } else if (ae2.localMin.polytype === PathType.Subject)
        return void 0;
      switch (this._fillrule) {
        case FillRule.Positive:
          if (ae2.windCount !== 1)
            return void 0;
          break;
        case FillRule.Negative:
          if (ae2.windCount !== -1)
            return void 0;
          break;
        default:
          if (Math.abs(ae2.windCount) !== 1)
            return void 0;
          break;
      }
      if (ClipperBase.isHotEdgeActive(ae1)) {
        resultOp = ClipperBase.addOutPt(ae1, pt);
        if (ClipperBase.isFront(ae1)) {
          ae1.outrec.frontEdge = void 0;
        } else {
          ae1.outrec.backEdge = void 0;
        }
        ae1.outrec = void 0;
      } else if (pt === ae1.localMin.vertex.pt && !ClipperBase.isOpenEnd(ae1.localMin.vertex)) {
        const ae3 = ClipperBase.findEdgeWithMatchingLocMin(ae1);
        if (ae3 && ClipperBase.isHotEdgeActive(ae3)) {
          ae1.outrec = ae3.outrec;
          if (ae1.windDx > 0) {
            ClipperBase.setSides(ae3.outrec, ae1, ae3);
          } else {
            ClipperBase.setSides(ae3.outrec, ae3, ae1);
          }
          return ae3.outrec.pts;
        }
        resultOp = this.startOpenPath(ae1, pt);
      } else {
        resultOp = this.startOpenPath(ae1, pt);
      }
      return resultOp;
    }
    if (ClipperBase.isJoined(ae1))
      this.split(ae1, pt);
    if (ClipperBase.isJoined(ae2))
      this.split(ae2, pt);
    let oldE1WindCount;
    let oldE2WindCount;
    if (ae1.localMin.polytype === ae2.localMin.polytype) {
      if (this._fillrule === FillRule.EvenOdd) {
        oldE1WindCount = ae1.windCount;
        ae1.windCount = ae2.windCount;
        ae2.windCount = oldE1WindCount;
      } else {
        if (ae1.windCount + ae2.windDx === 0)
          ae1.windCount = -ae1.windCount;
        else
          ae1.windCount += ae2.windDx;
        if (ae2.windCount - ae1.windDx === 0)
          ae2.windCount = -ae2.windCount;
        else
          ae2.windCount -= ae1.windDx;
      }
    } else {
      if (this._fillrule !== FillRule.EvenOdd)
        ae1.windCount2 += ae2.windDx;
      else
        ae1.windCount2 = ae1.windCount2 === 0 ? 1 : 0;
      if (this._fillrule !== FillRule.EvenOdd)
        ae2.windCount2 -= ae1.windDx;
      else
        ae2.windCount2 = ae2.windCount2 === 0 ? 1 : 0;
    }
    switch (this._fillrule) {
      case FillRule.Positive:
        oldE1WindCount = ae1.windCount;
        oldE2WindCount = ae2.windCount;
        break;
      case FillRule.Negative:
        oldE1WindCount = -ae1.windCount;
        oldE2WindCount = -ae2.windCount;
        break;
      default:
        oldE1WindCount = Math.abs(ae1.windCount);
        oldE2WindCount = Math.abs(ae2.windCount);
        break;
    }
    const e1WindCountIs0or1 = oldE1WindCount === 0 || oldE1WindCount === 1;
    const e2WindCountIs0or1 = oldE2WindCount === 0 || oldE2WindCount === 1;
    if (!ClipperBase.isHotEdgeActive(ae1) && !e1WindCountIs0or1 || !ClipperBase.isHotEdgeActive(ae2) && !e2WindCountIs0or1)
      return void 0;
    if (ClipperBase.isHotEdgeActive(ae1) && ClipperBase.isHotEdgeActive(ae2)) {
      if (oldE1WindCount !== 0 && oldE1WindCount !== 1 || oldE2WindCount !== 0 && oldE2WindCount !== 1 || ae1.localMin.polytype !== ae2.localMin.polytype && this._cliptype !== ClipType.Xor) {
        resultOp = this.addLocalMaxPoly(ae1, ae2, pt);
      } else if (ClipperBase.isFront(ae1) || ae1.outrec === ae2.outrec) {
        resultOp = this.addLocalMaxPoly(ae1, ae2, pt);
        this.addLocalMinPoly(ae1, ae2, pt);
      } else {
        resultOp = ClipperBase.addOutPt(ae1, pt);
        ClipperBase.addOutPt(ae2, pt);
        ClipperBase.swapOutrecs(ae1, ae2);
      }
    } else if (ClipperBase.isHotEdgeActive(ae1)) {
      resultOp = ClipperBase.addOutPt(ae1, pt);
      ClipperBase.swapOutrecs(ae1, ae2);
    } else if (ClipperBase.isHotEdgeActive(ae2)) {
      resultOp = ClipperBase.addOutPt(ae2, pt);
      ClipperBase.swapOutrecs(ae1, ae2);
    } else {
      let e1Wc2;
      let e2Wc2;
      switch (this._fillrule) {
        case FillRule.Positive:
          e1Wc2 = ae1.windCount2;
          e2Wc2 = ae2.windCount2;
          break;
        case FillRule.Negative:
          e1Wc2 = -ae1.windCount2;
          e2Wc2 = -ae2.windCount2;
          break;
        default:
          e1Wc2 = Math.abs(ae1.windCount2);
          e2Wc2 = Math.abs(ae2.windCount2);
          break;
      }
      if (!ClipperBase.isSamePolyType(ae1, ae2)) {
        resultOp = this.addLocalMinPoly(ae1, ae2, pt);
      } else if (oldE1WindCount === 1 && oldE2WindCount === 1) {
        resultOp = void 0;
        switch (this._cliptype) {
          case ClipType.Union:
            if (e1Wc2 > 0 && e2Wc2 > 0)
              return void 0;
            resultOp = this.addLocalMinPoly(ae1, ae2, pt);
            break;
          case ClipType.Difference:
            if (ClipperBase.getPolyType(ae1) === PathType.Clip && e1Wc2 > 0 && e2Wc2 > 0 || ClipperBase.getPolyType(ae1) === PathType.Subject && e1Wc2 <= 0 && e2Wc2 <= 0) {
              resultOp = this.addLocalMinPoly(ae1, ae2, pt);
            }
            break;
          case ClipType.Xor:
            resultOp = this.addLocalMinPoly(ae1, ae2, pt);
            break;
          default:
            if (e1Wc2 <= 0 || e2Wc2 <= 0)
              return void 0;
            resultOp = this.addLocalMinPoly(ae1, ae2, pt);
            break;
        }
      }
    }
    return resultOp;
  }
  deleteFromAEL(ae) {
    const prev = ae.prevInAEL;
    const next = ae.nextInAEL;
    if (!prev && !next && ae !== this._actives)
      return;
    if (prev)
      prev.nextInAEL = next;
    else
      this._actives = next;
    if (next)
      next.prevInAEL = prev;
  }
  adjustCurrXAndCopyToSEL(topY) {
    let ae = this._actives;
    this._sel = ae;
    while (ae) {
      ae.prevInSEL = ae.prevInAEL;
      ae.nextInSEL = ae.nextInAEL;
      ae.jump = ae.nextInSEL;
      if (ae.joinWith === JoinWith.Left)
        ae.curX = ae.prevInAEL.curX;
      else
        ae.curX = ClipperBase.topX(ae, topY);
      ae = ae.nextInAEL;
    }
  }
  executeInternal(ct, fillRule) {
    if (ct === ClipType.None)
      return;
    this._fillrule = fillRule;
    this._cliptype = ct;
    this.reset();
    let y = this.popScanline();
    if (y === void 0)
      return;
    while (this._succeeded) {
      this.insertLocalMinimaIntoAEL(y);
      let ae = this.popHorz();
      while (ae) {
        this.doHorizontal(ae);
        ae = this.popHorz();
      }
      if (this._horzSegList.length > 0) {
        this.convertHorzSegsToJoins();
        this._horzSegList.length = 0;
      }
      this._currentBotY = y;
      y = this.popScanline();
      if (y === void 0)
        break;
      this.doIntersections(y);
      this.doTopOfScanbeam(y);
      ae = this.popHorz();
      while (ae) {
        this.doHorizontal(ae);
        ae = this.popHorz();
      }
    }
    if (this._succeeded)
      this.processHorzJoins();
  }
  doIntersections(topY) {
    if (this.buildIntersectList(topY)) {
      this.processIntersectList();
      this.disposeIntersectNodes();
    }
  }
  disposeIntersectNodes() {
    this._intersectList.length = 0;
  }
  addNewIntersectNode(ae1, ae2, topY) {
    const result = InternalClipper.getIntersectPt(ae1.bot, ae1.top, ae2.bot, ae2.top);
    let ip = result.ip;
    if (!result.success) {
      ip = new Point64(ae1.curX, topY);
    }
    if (ip.y > this._currentBotY || ip.y < topY) {
      const absDx1 = Math.abs(ae1.dx);
      const absDx2 = Math.abs(ae2.dx);
      if (absDx1 > 100 && absDx2 > 100) {
        if (absDx1 > absDx2) {
          ip = InternalClipper.getClosestPtOnSegment(ip, ae1.bot, ae1.top);
        } else {
          ip = InternalClipper.getClosestPtOnSegment(ip, ae2.bot, ae2.top);
        }
      } else if (absDx1 > 100) {
        ip = InternalClipper.getClosestPtOnSegment(ip, ae1.bot, ae1.top);
      } else if (absDx2 > 100) {
        ip = InternalClipper.getClosestPtOnSegment(ip, ae2.bot, ae2.top);
      } else {
        if (ip.y < topY) {
          ip.y = topY;
        } else {
          ip.y = this._currentBotY;
        }
        if (absDx1 < absDx2) {
          ip.x = ClipperBase.topX(ae1, ip.y);
        } else {
          ip.x = ClipperBase.topX(ae2, ip.y);
        }
      }
    }
    const node = new IntersectNode(ip, ae1, ae2);
    this._intersectList.push(node);
  }
  static extractFromSEL(ae) {
    const res = ae.nextInSEL;
    if (res) {
      res.prevInSEL = ae.prevInSEL;
    }
    ae.prevInSEL.nextInSEL = res;
    return res;
  }
  static insert1Before2InSEL(ae1, ae2) {
    ae1.prevInSEL = ae2.prevInSEL;
    if (ae1.prevInSEL) {
      ae1.prevInSEL.nextInSEL = ae1;
    }
    ae1.nextInSEL = ae2;
    ae2.prevInSEL = ae1;
  }
  buildIntersectList(topY) {
    if (!this._actives || !this._actives.nextInAEL)
      return false;
    this.adjustCurrXAndCopyToSEL(topY);
    let left = this._sel, right, lEnd, rEnd, currBase, prevBase, tmp;
    while (left.jump) {
      prevBase = void 0;
      while (left && left.jump) {
        currBase = left;
        right = left.jump;
        lEnd = right;
        rEnd = right.jump;
        left.jump = rEnd;
        while (left !== lEnd && right !== rEnd) {
          if (right.curX < left.curX) {
            tmp = right.prevInSEL;
            for (; ; ) {
              this.addNewIntersectNode(tmp, right, topY);
              if (tmp === left)
                break;
              tmp = tmp.prevInSEL;
            }
            tmp = right;
            right = ClipperBase.extractFromSEL(tmp);
            lEnd = right;
            ClipperBase.insert1Before2InSEL(tmp, left);
            if (left === currBase) {
              currBase = tmp;
              currBase.jump = rEnd;
              if (prevBase === void 0)
                this._sel = currBase;
              else
                prevBase.jump = currBase;
            }
          } else {
            left = left.nextInSEL;
          }
        }
        prevBase = currBase;
        left = rEnd;
      }
      left = this._sel;
    }
    return this._intersectList.length > 0;
  }
  processIntersectList() {
    this._intersectList.sort((a, b) => {
      if (a.pt.y === b.pt.y) {
        if (a.pt.x === b.pt.x)
          return 0;
        return a.pt.x < b.pt.x ? -1 : 1;
      }
      return a.pt.y > b.pt.y ? -1 : 1;
    });
    for (let i = 0; i < this._intersectList.length; ++i) {
      if (!ClipperBase.edgesAdjacentInAEL(this._intersectList[i])) {
        let j = i + 1;
        while (!ClipperBase.edgesAdjacentInAEL(this._intersectList[j]))
          j++;
        [this._intersectList[j], this._intersectList[i]] = [this._intersectList[i], this._intersectList[j]];
      }
      const node = this._intersectList[i];
      this.intersectEdges(node.edge1, node.edge2, node.pt);
      this.swapPositionsInAEL(node.edge1, node.edge2);
      node.edge1.curX = node.pt.x;
      node.edge2.curX = node.pt.x;
      this.checkJoinLeft(node.edge2, node.pt, true);
      this.checkJoinRight(node.edge1, node.pt, true);
    }
  }
  swapPositionsInAEL(ae1, ae2) {
    const next = ae2.nextInAEL;
    if (next)
      next.prevInAEL = ae1;
    const prev = ae1.prevInAEL;
    if (prev)
      prev.nextInAEL = ae2;
    ae2.prevInAEL = prev;
    ae2.nextInAEL = ae1;
    ae1.prevInAEL = ae2;
    ae1.nextInAEL = next;
    if (!ae2.prevInAEL)
      this._actives = ae2;
  }
  static resetHorzDirection(horz, vertexMax) {
    let leftX, rightX;
    if (horz.bot.x === horz.top.x) {
      leftX = horz.curX;
      rightX = horz.curX;
      let ae = horz.nextInAEL;
      while (ae && ae.vertexTop !== vertexMax)
        ae = ae.nextInAEL;
      return { isLeftToRight: ae !== void 0, leftX, rightX };
    }
    if (horz.curX < horz.top.x) {
      leftX = horz.curX;
      rightX = horz.top.x;
      return { isLeftToRight: true, leftX, rightX };
    }
    leftX = horz.top.x;
    rightX = horz.curX;
    return { isLeftToRight: false, leftX, rightX };
  }
  static horzIsSpike(horz) {
    const nextPt = ClipperBase.nextVertex(horz).pt;
    return horz.bot.x < horz.top.x !== horz.top.x < nextPt.x;
  }
  static trimHorz(horzEdge, preserveCollinear) {
    let wasTrimmed = false;
    let pt = ClipperBase.nextVertex(horzEdge).pt;
    while (pt.y === horzEdge.top.y) {
      if (preserveCollinear && pt.x < horzEdge.top.x !== horzEdge.bot.x < horzEdge.top.x) {
        break;
      }
      horzEdge.vertexTop = ClipperBase.nextVertex(horzEdge);
      horzEdge.top = pt;
      wasTrimmed = true;
      if (ClipperBase.isMaximaActive(horzEdge))
        break;
      pt = ClipperBase.nextVertex(horzEdge).pt;
    }
    if (wasTrimmed)
      ClipperBase.setDx(horzEdge);
  }
  addToHorzSegList(op) {
    if (op.outrec.isOpen)
      return;
    this._horzSegList.push(new HorzSegment(op));
  }
  getLastOp(hotEdge) {
    const outrec = hotEdge.outrec;
    return hotEdge === outrec.frontEdge ? outrec.pts : outrec.pts.next;
  }
  /*******************************************************************************
  * Notes: Horizontal edges (HEs) at scanline intersections (i.e. at the top or    *
  * bottom of a scanbeam) are processed as if layered.The order in which HEs     *
  * are processed doesn't matter. HEs intersect with the bottom vertices of      *
  * other HEs[#] and with non-horizontal edges [*]. Once these intersections     *
  * are completed, intermediate HEs are 'promoted' to the next edge in their     *
  * bounds, and they in turn may be intersected[%] by other HEs.                 *
  *                                                                              *
  * eg: 3 horizontals at a scanline:    /   |                     /           /  *
  *              |                     /    |     (HE3)o ========%========== o   *
  *              o ======= o(HE2)     /     |         /         /                *
  *          o ============#=========*======*========#=========o (HE1)           *
  *         /              |        /       |       /                            *
  *******************************************************************************/
  doHorizontal(horz) {
    let pt;
    const horzIsOpen = ClipperBase.isOpen(horz);
    const Y = horz.bot.y;
    const vertex_max = horzIsOpen ? ClipperBase.getCurrYMaximaVertex_Open(horz) : ClipperBase.getCurrYMaximaVertex(horz);
    if (vertex_max && !horzIsOpen && vertex_max !== horz.vertexTop)
      ClipperBase.trimHorz(horz, this.preserveCollinear);
    let { isLeftToRight, leftX, rightX } = ClipperBase.resetHorzDirection(horz, vertex_max);
    if (ClipperBase.isHotEdgeActive(horz)) {
      const op = ClipperBase.addOutPt(horz, new Point64(horz.curX, Y));
      this.addToHorzSegList(op);
    }
    for (; ; ) {
      let ae = isLeftToRight ? horz.nextInAEL : horz.prevInAEL;
      while (ae) {
        if (ae.vertexTop === vertex_max) {
          if (ClipperBase.isHotEdgeActive(horz) && ClipperBase.isJoined(ae))
            this.split(ae, ae.top);
          if (ClipperBase.isHotEdgeActive(horz)) {
            while (horz.vertexTop !== vertex_max) {
              ClipperBase.addOutPt(horz, horz.top);
              this.updateEdgeIntoAEL(horz);
            }
            if (isLeftToRight)
              this.addLocalMaxPoly(horz, ae, horz.top);
            else
              this.addLocalMaxPoly(ae, horz, horz.top);
          }
          this.deleteFromAEL(ae);
          this.deleteFromAEL(horz);
          return;
        }
        if (vertex_max !== horz.vertexTop || ClipperBase.isOpenEndActive(horz)) {
          if (isLeftToRight && ae.curX > rightX || !isLeftToRight && ae.curX < leftX)
            break;
          if (ae.curX === horz.top.x && !ClipperBase.isHorizontal(ae)) {
            pt = ClipperBase.nextVertex(horz).pt;
            if (ClipperBase.isOpen(ae) && !ClipperBase.isSamePolyType(ae, horz) && !ClipperBase.isHotEdgeActive(ae)) {
              if (isLeftToRight && ClipperBase.topX(ae, pt.y) > pt.x || !isLeftToRight && ClipperBase.topX(ae, pt.y) < pt.x)
                break;
            } else if (isLeftToRight && ClipperBase.topX(ae, pt.y) >= pt.x || !isLeftToRight && ClipperBase.topX(ae, pt.y) <= pt.x)
              break;
          }
        }
        pt = new Point64(ae.curX, Y);
        if (isLeftToRight) {
          this.intersectEdges(horz, ae, pt);
          this.swapPositionsInAEL(horz, ae);
          horz.curX = ae.curX;
          ae = horz.nextInAEL;
        } else {
          this.intersectEdges(ae, horz, pt);
          this.swapPositionsInAEL(ae, horz);
          horz.curX = ae.curX;
          ae = horz.prevInAEL;
        }
        if (ClipperBase.isHotEdgeActive(horz))
          this.addToHorzSegList(this.getLastOp(horz));
      }
      if (horzIsOpen && ClipperBase.isOpenEndActive(horz)) {
        if (ClipperBase.isHotEdgeActive(horz)) {
          ClipperBase.addOutPt(horz, horz.top);
          if (ClipperBase.isFront(horz))
            horz.outrec.frontEdge = void 0;
          else
            horz.outrec.backEdge = void 0;
          horz.outrec = void 0;
        }
        this.deleteFromAEL(horz);
        return;
      } else if (ClipperBase.nextVertex(horz).pt.y !== horz.top.y)
        break;
      if (ClipperBase.isHotEdgeActive(horz)) {
        ClipperBase.addOutPt(horz, horz.top);
      }
      this.updateEdgeIntoAEL(horz);
      if (this.preserveCollinear && !horzIsOpen && ClipperBase.horzIsSpike(horz)) {
        ClipperBase.trimHorz(horz, true);
      }
      const result = ClipperBase.resetHorzDirection(horz, vertex_max);
      isLeftToRight = result.isLeftToRight;
      leftX = result.leftX;
      rightX = result.rightX;
    }
    if (ClipperBase.isHotEdgeActive(horz)) {
      const op = ClipperBase.addOutPt(horz, horz.top);
      this.addToHorzSegList(op);
    }
    this.updateEdgeIntoAEL(horz);
  }
  doTopOfScanbeam(y) {
    this._sel = void 0;
    let ae = this._actives;
    while (ae) {
      if (ae.top.y === y) {
        ae.curX = ae.top.x;
        if (ClipperBase.isMaximaActive(ae)) {
          ae = this.doMaxima(ae);
          continue;
        }
        if (ClipperBase.isHotEdgeActive(ae))
          ClipperBase.addOutPt(ae, ae.top);
        this.updateEdgeIntoAEL(ae);
        if (ClipperBase.isHorizontal(ae))
          this.pushHorz(ae);
      } else {
        ae.curX = ClipperBase.topX(ae, y);
      }
      ae = ae.nextInAEL;
    }
  }
  doMaxima(ae) {
    const prevE = ae.prevInAEL;
    let nextE = ae.nextInAEL;
    if (ClipperBase.isOpenEndActive(ae)) {
      if (ClipperBase.isHotEdgeActive(ae))
        ClipperBase.addOutPt(ae, ae.top);
      if (!ClipperBase.isHorizontal(ae)) {
        if (ClipperBase.isHotEdgeActive(ae)) {
          if (ClipperBase.isFront(ae))
            ae.outrec.frontEdge = void 0;
          else
            ae.outrec.backEdge = void 0;
          ae.outrec = void 0;
        }
        this.deleteFromAEL(ae);
      }
      return nextE;
    }
    const maxPair = ClipperBase.getMaximaPair(ae);
    if (!maxPair)
      return nextE;
    if (ClipperBase.isJoined(ae))
      this.split(ae, ae.top);
    if (ClipperBase.isJoined(maxPair))
      this.split(maxPair, maxPair.top);
    while (nextE !== maxPair) {
      this.intersectEdges(ae, nextE, ae.top);
      this.swapPositionsInAEL(ae, nextE);
      nextE = ae.nextInAEL;
    }
    if (ClipperBase.isOpen(ae)) {
      if (ClipperBase.isHotEdgeActive(ae))
        this.addLocalMaxPoly(ae, maxPair, ae.top);
      this.deleteFromAEL(maxPair);
      this.deleteFromAEL(ae);
      return prevE ? prevE.nextInAEL : this._actives;
    }
    if (ClipperBase.isHotEdgeActive(ae))
      this.addLocalMaxPoly(ae, maxPair, ae.top);
    this.deleteFromAEL(ae);
    this.deleteFromAEL(maxPair);
    return prevE ? prevE.nextInAEL : this._actives;
  }
  static isJoined(e) {
    return e.joinWith !== JoinWith.None;
  }
  split(e, currPt) {
    if (e.joinWith === JoinWith.Right) {
      e.joinWith = JoinWith.None;
      e.nextInAEL.joinWith = JoinWith.None;
      this.addLocalMinPoly(e, e.nextInAEL, currPt, true);
    } else {
      e.joinWith = JoinWith.None;
      e.prevInAEL.joinWith = JoinWith.None;
      this.addLocalMinPoly(e.prevInAEL, e, currPt, true);
    }
  }
  checkJoinLeft(e, pt, checkCurrX = false) {
    const prev = e.prevInAEL;
    if (!prev || ClipperBase.isOpen(e) || ClipperBase.isOpen(prev) || !ClipperBase.isHotEdgeActive(e) || !ClipperBase.isHotEdgeActive(prev))
      return;
    if ((pt.y < e.top.y + 2 || pt.y < prev.top.y + 2) && // avoid trivial joins
    (e.bot.y > pt.y || prev.bot.y > pt.y))
      return;
    if (checkCurrX) {
      if (Clipper.perpendicDistFromLineSqrd(pt, prev.bot, prev.top) > 0.25)
        return;
    } else if (e.curX !== prev.curX)
      return;
    if (InternalClipper.crossProduct(e.top, pt, prev.top) !== 0)
      return;
    if (e.outrec.idx === prev.outrec.idx)
      this.addLocalMaxPoly(prev, e, pt);
    else if (e.outrec.idx < prev.outrec.idx)
      ClipperBase.joinOutrecPaths(e, prev);
    else
      ClipperBase.joinOutrecPaths(prev, e);
    prev.joinWith = JoinWith.Right;
    e.joinWith = JoinWith.Left;
  }
  checkJoinRight(e, pt, checkCurrX = false) {
    const next = e.nextInAEL;
    if (ClipperBase.isOpen(e) || !ClipperBase.isHotEdgeActive(e) || ClipperBase.isJoined(e) || !next || ClipperBase.isOpen(next) || !ClipperBase.isHotEdgeActive(next))
      return;
    if ((pt.y < e.top.y + 2 || pt.y < next.top.y + 2) && // avoid trivial joins
    (e.bot.y > pt.y || next.bot.y > pt.y))
      return;
    if (checkCurrX) {
      if (Clipper.perpendicDistFromLineSqrd(pt, next.bot, next.top) > 0.25)
        return;
    } else if (e.curX !== next.curX)
      return;
    if (InternalClipper.crossProduct(e.top, pt, next.top) !== 0)
      return;
    if (e.outrec.idx === next.outrec.idx)
      this.addLocalMaxPoly(e, next, pt);
    else if (e.outrec.idx < next.outrec.idx)
      ClipperBase.joinOutrecPaths(e, next);
    else
      ClipperBase.joinOutrecPaths(next, e);
    e.joinWith = JoinWith.Right;
    next.joinWith = JoinWith.Left;
  }
  static fixOutRecPts(outrec) {
    let op = outrec.pts;
    do {
      op.outrec = outrec;
      op = op.next;
    } while (op !== outrec.pts);
  }
  static setHorzSegHeadingForward(hs, opP, opN) {
    if (opP.pt.x === opN.pt.x)
      return false;
    if (opP.pt.x < opN.pt.x) {
      hs.leftOp = opP;
      hs.rightOp = opN;
      hs.leftToRight = true;
    } else {
      hs.leftOp = opN;
      hs.rightOp = opP;
      hs.leftToRight = false;
    }
    return true;
  }
  static updateHorzSegment(hs) {
    const op = hs.leftOp;
    const outrec = this.getRealOutRec(op.outrec);
    const outrecHasEdges = outrec.frontEdge !== void 0;
    const curr_y = op.pt.y;
    let opP = op, opN = op;
    if (outrecHasEdges) {
      const opA = outrec.pts, opZ = opA.next;
      while (opP !== opZ && opP.prev.pt.y === curr_y)
        opP = opP.prev;
      while (opN !== opA && opN.next.pt.y === curr_y)
        opN = opN.next;
    } else {
      while (opP.prev !== opN && opP.prev.pt.y === curr_y)
        opP = opP.prev;
      while (opN.next !== opP && opN.next.pt.y === curr_y)
        opN = opN.next;
    }
    const result = this.setHorzSegHeadingForward(hs, opP, opN) && hs.leftOp.horz === void 0;
    if (result)
      hs.leftOp.horz = hs;
    else
      hs.rightOp = void 0;
    return result;
  }
  static duplicateOp(op, insert_after) {
    const result = new OutPt(op.pt, op.outrec);
    if (insert_after) {
      result.next = op.next;
      result.next.prev = result;
      result.prev = op;
      op.next = result;
    } else {
      result.prev = op.prev;
      result.prev.next = result;
      result.next = op;
      op.prev = result;
    }
    return result;
  }
  convertHorzSegsToJoins() {
    let k = 0;
    for (const hs of this._horzSegList) {
      if (ClipperBase.updateHorzSegment(hs))
        k++;
    }
    if (k < 2)
      return;
    this._horzSegList.sort((hs1, hs2) => {
      if (!hs1 || !hs2)
        return 0;
      if (!hs1.rightOp) {
        return !hs2.rightOp ? 0 : 1;
      } else if (!hs2.rightOp)
        return -1;
      else
        return hs1.leftOp.pt.x - hs2.leftOp.pt.x;
    });
    for (let i = 0; i < k - 1; i++) {
      const hs1 = this._horzSegList[i];
      for (let j = i + 1; j < k; j++) {
        const hs2 = this._horzSegList[j];
        if (hs2.leftOp.pt.x >= hs1.rightOp.pt.x || hs2.leftToRight === hs1.leftToRight || hs2.rightOp.pt.x <= hs1.leftOp.pt.x)
          continue;
        const curr_y = hs1.leftOp.pt.y;
        if (hs1.leftToRight) {
          while (hs1.leftOp.next.pt.y === curr_y && hs1.leftOp.next.pt.x <= hs2.leftOp.pt.x) {
            hs1.leftOp = hs1.leftOp.next;
          }
          while (hs2.leftOp.prev.pt.y === curr_y && hs2.leftOp.prev.pt.x <= hs1.leftOp.pt.x) {
            hs2.leftOp = hs2.leftOp.prev;
          }
          const join = new HorzJoin(ClipperBase.duplicateOp(hs1.leftOp, true), ClipperBase.duplicateOp(hs2.leftOp, false));
          this._horzJoinList.push(join);
        } else {
          while (hs1.leftOp.prev.pt.y === curr_y && hs1.leftOp.prev.pt.x <= hs2.leftOp.pt.x) {
            hs1.leftOp = hs1.leftOp.prev;
          }
          while (hs2.leftOp.next.pt.y === curr_y && hs2.leftOp.next.pt.x <= hs1.leftOp.pt.x) {
            hs2.leftOp = hs2.leftOp.next;
          }
          const join = new HorzJoin(ClipperBase.duplicateOp(hs2.leftOp, true), ClipperBase.duplicateOp(hs1.leftOp, false));
          this._horzJoinList.push(join);
        }
      }
    }
  }
  static getCleanPath(op) {
    const result = new Path64();
    let op2 = op;
    while (op2.next !== op && (op2.pt.x === op2.next.pt.x && op2.pt.x === op2.prev.pt.x || op2.pt.y === op2.next.pt.y && op2.pt.y === op2.prev.pt.y)) {
      op2 = op2.next;
    }
    result.push(op2.pt);
    let prevOp = op2;
    op2 = op2.next;
    while (op2 !== op) {
      if ((op2.pt.x !== op2.next.pt.x || op2.pt.x !== prevOp.pt.x) && (op2.pt.y !== op2.next.pt.y || op2.pt.y !== prevOp.pt.y)) {
        result.push(op2.pt);
        prevOp = op2;
      }
      op2 = op2.next;
    }
    return result;
  }
  static pointInOpPolygon(pt, op) {
    if (op === op.next || op.prev === op.next)
      return PointInPolygonResult.IsOutside;
    let op2 = op;
    do {
      if (op.pt.y !== pt.y)
        break;
      op = op.next;
    } while (op !== op2);
    if (op.pt.y === pt.y)
      return PointInPolygonResult.IsOutside;
    let isAbove = op.pt.y < pt.y;
    const startingAbove = isAbove;
    let val = 0;
    op2 = op.next;
    while (op2 !== op) {
      if (isAbove)
        while (op2 !== op && op2.pt.y < pt.y)
          op2 = op2.next;
      else
        while (op2 !== op && op2.pt.y > pt.y)
          op2 = op2.next;
      if (op2 === op)
        break;
      if (op2.pt.y === pt.y) {
        if (op2.pt.x === pt.x || op2.pt.y === op2.prev.pt.y && pt.x < op2.prev.pt.x !== pt.x < op2.pt.x)
          return PointInPolygonResult.IsOn;
        op2 = op2.next;
        if (op2 === op)
          break;
        continue;
      }
      if (op2.pt.x <= pt.x || op2.prev.pt.x <= pt.x) {
        if (op2.prev.pt.x < pt.x && op2.pt.x < pt.x)
          val = 1 - val;
        else {
          const d = InternalClipper.crossProduct(op2.prev.pt, op2.pt, pt);
          if (d === 0)
            return PointInPolygonResult.IsOn;
          if (d < 0 === isAbove)
            val = 1 - val;
        }
      }
      isAbove = !isAbove;
      op2 = op2.next;
    }
    if (isAbove !== startingAbove) {
      const d = InternalClipper.crossProduct(op2.prev.pt, op2.pt, pt);
      if (d === 0)
        return PointInPolygonResult.IsOn;
      if (d < 0 === isAbove)
        val = 1 - val;
    }
    if (val === 0)
      return PointInPolygonResult.IsOutside;
    else
      return PointInPolygonResult.IsInside;
  }
  static path1InsidePath2(op1, op2) {
    let result;
    let outside_cnt = 0;
    let op = op1;
    do {
      result = this.pointInOpPolygon(op.pt, op2);
      if (result === PointInPolygonResult.IsOutside)
        ++outside_cnt;
      else if (result === PointInPolygonResult.IsInside)
        --outside_cnt;
      op = op.next;
    } while (op !== op1 && Math.abs(outside_cnt) < 2);
    if (Math.abs(outside_cnt) > 1)
      return outside_cnt < 0;
    const mp = ClipperBase.getBoundsPath(this.getCleanPath(op1)).midPoint();
    const path2 = this.getCleanPath(op2);
    return InternalClipper.pointInPolygon(mp, path2) !== PointInPolygonResult.IsOutside;
  }
  moveSplits(fromOr, toOr) {
    if (!fromOr.splits)
      return;
    toOr.splits = toOr.splits || [];
    for (const i of fromOr.splits) {
      toOr.splits.push(i);
    }
    fromOr.splits = void 0;
  }
  processHorzJoins() {
    for (const j of this._horzJoinList) {
      const or1 = ClipperBase.getRealOutRec(j.op1.outrec);
      let or2 = ClipperBase.getRealOutRec(j.op2.outrec);
      const op1b = j.op1.next;
      const op2b = j.op2.prev;
      j.op1.next = j.op2;
      j.op2.prev = j.op1;
      op1b.prev = op2b;
      op2b.next = op1b;
      if (or1 === or2) {
        or2 = this.newOutRec();
        or2.pts = op1b;
        ClipperBase.fixOutRecPts(or2);
        if (or1.pts.outrec === or2) {
          or1.pts = j.op1;
          or1.pts.outrec = or1;
        }
        if (this._using_polytree) {
          if (ClipperBase.path1InsidePath2(or1.pts, or2.pts)) {
            const tmp = or1.pts;
            or1.pts = or2.pts;
            or2.pts = tmp;
            ClipperBase.fixOutRecPts(or1);
            ClipperBase.fixOutRecPts(or2);
            or2.owner = or1.owner;
          } else if (ClipperBase.path1InsidePath2(or2.pts, or1.pts)) {
            or2.owner = or1;
          } else {
            or2.owner = or1.owner;
          }
          or1.splits = or1.splits || [];
          or1.splits.push(or2.idx);
        } else {
          or2.owner = or1;
        }
      } else {
        or2.pts = void 0;
        if (this._using_polytree) {
          ClipperBase.setOwner(or2, or1);
          this.moveSplits(or2, or1);
        } else {
          or2.owner = or1;
        }
      }
    }
  }
  static ptsReallyClose(pt1, pt2) {
    return Math.abs(pt1.x - pt2.x) < 2 && Math.abs(pt1.y - pt2.y) < 2;
  }
  static isVerySmallTriangle(op) {
    return op.next.next === op.prev && (this.ptsReallyClose(op.prev.pt, op.next.pt) || this.ptsReallyClose(op.pt, op.next.pt) || this.ptsReallyClose(op.pt, op.prev.pt));
  }
  static isValidClosedPath(op) {
    return op !== void 0 && op.next !== op && (op.next !== op.prev || !this.isVerySmallTriangle(op));
  }
  static disposeOutPt(op) {
    const result = op.next === op ? void 0 : op.next;
    op.prev.next = op.next;
    op.next.prev = op.prev;
    return result;
  }
  cleanCollinear(outrec) {
    outrec = ClipperBase.getRealOutRec(outrec);
    if (outrec === void 0 || outrec.isOpen)
      return;
    if (!ClipperBase.isValidClosedPath(outrec.pts)) {
      outrec.pts = void 0;
      return;
    }
    let startOp = outrec.pts;
    let op2 = startOp;
    for (; ; ) {
      if (InternalClipper.crossProduct(op2.prev.pt, op2.pt, op2.next.pt) === 0 && (op2.pt === op2.prev.pt || op2.pt === op2.next.pt || !this.preserveCollinear || InternalClipper.dotProduct(op2.prev.pt, op2.pt, op2.next.pt) < 0)) {
        if (op2 === outrec.pts) {
          outrec.pts = op2.prev;
        }
        op2 = ClipperBase.disposeOutPt(op2);
        if (!ClipperBase.isValidClosedPath(op2)) {
          outrec.pts = void 0;
          return;
        }
        startOp = op2;
        continue;
      }
      op2 = op2.next;
      if (op2 === startOp)
        break;
    }
    this.fixSelfIntersects(outrec);
  }
  doSplitOp(outrec, splitOp) {
    const prevOp = splitOp.prev;
    const nextNextOp = splitOp.next.next;
    outrec.pts = prevOp;
    const ip = InternalClipper.getIntersectPoint(prevOp.pt, splitOp.pt, splitOp.next.pt, nextNextOp.pt).ip;
    const area1 = ClipperBase.area(prevOp);
    const absArea1 = Math.abs(area1);
    if (absArea1 < 2) {
      outrec.pts = void 0;
      return;
    }
    const area2 = ClipperBase.areaTriangle(ip, splitOp.pt, splitOp.next.pt);
    const absArea2 = Math.abs(area2);
    if (ip === prevOp.pt || ip === nextNextOp.pt) {
      nextNextOp.prev = prevOp;
      prevOp.next = nextNextOp;
    } else {
      const newOp2 = new OutPt(ip, outrec);
      newOp2.prev = prevOp;
      newOp2.next = nextNextOp;
      nextNextOp.prev = newOp2;
      prevOp.next = newOp2;
    }
    if (absArea2 > 1 && (absArea2 > absArea1 || area2 > 0 === area1 > 0)) {
      const newOutRec = this.newOutRec();
      newOutRec.owner = outrec.owner;
      splitOp.outrec = newOutRec;
      splitOp.next.outrec = newOutRec;
      const newOp = new OutPt(ip, newOutRec);
      newOp.prev = splitOp.next;
      newOp.next = splitOp;
      newOutRec.pts = newOp;
      splitOp.prev = newOp;
      splitOp.next.next = newOp;
      if (this._using_polytree) {
        if (ClipperBase.path1InsidePath2(prevOp, newOp)) {
          newOutRec.splits = newOutRec.splits || [];
          newOutRec.splits.push(outrec.idx);
        } else {
          outrec.splits = outrec.splits || [];
          outrec.splits.push(newOutRec.idx);
        }
      }
    }
  }
  fixSelfIntersects(outrec) {
    let op2 = outrec.pts;
    for (; ; ) {
      if (op2.prev === op2.next.next)
        break;
      if (InternalClipper.segsIntersect(op2.prev.pt, op2.pt, op2.next.pt, op2.next.next.pt)) {
        this.doSplitOp(outrec, op2);
        if (!outrec.pts)
          return;
        op2 = outrec.pts;
        continue;
      } else {
        op2 = op2.next;
      }
      if (op2 === outrec.pts)
        break;
    }
  }
  static buildPath(op, reverse, isOpen, path) {
    if (op === void 0 || op.next === op || !isOpen && op.next === op.prev)
      return false;
    path.length = 0;
    let lastPt;
    let op2;
    if (reverse) {
      lastPt = op.pt;
      op2 = op.prev;
    } else {
      op = op.next;
      lastPt = op.pt;
      op2 = op.next;
    }
    path.push(lastPt);
    while (op2 !== op) {
      if (op2.pt !== lastPt) {
        lastPt = op2.pt;
        path.push(lastPt);
      }
      if (reverse) {
        op2 = op2.prev;
      } else {
        op2 = op2.next;
      }
    }
    if (path.length === 3 && this.isVerySmallTriangle(op2))
      return false;
    else
      return true;
  }
  buildPaths(solutionClosed, solutionOpen) {
    solutionClosed.length = 0;
    solutionOpen.length = 0;
    let i = 0;
    while (i < this._outrecList.length) {
      const outrec = this._outrecList[i++];
      if (!outrec.pts)
        continue;
      const path = new Path64();
      if (outrec.isOpen) {
        if (ClipperBase.buildPath(outrec.pts, this.reverseSolution, true, path)) {
          solutionOpen.push(path);
        }
      } else {
        this.cleanCollinear(outrec);
        if (ClipperBase.buildPath(outrec.pts, this.reverseSolution, false, path)) {
          solutionClosed.push(path);
        }
      }
    }
    return true;
  }
  static getBoundsPath(path) {
    if (path.length === 0)
      return new Rect64();
    const result = Clipper.InvalidRect64;
    for (const pt of path) {
      if (pt.x < result.left)
        result.left = pt.x;
      if (pt.x > result.right)
        result.right = pt.x;
      if (pt.y < result.top)
        result.top = pt.y;
      if (pt.y > result.bottom)
        result.bottom = pt.y;
    }
    return result;
  }
  checkBounds(outrec) {
    if (outrec.pts === void 0)
      return false;
    if (!outrec.bounds.isEmpty())
      return true;
    this.cleanCollinear(outrec);
    if (outrec.pts === void 0 || !ClipperBase.buildPath(outrec.pts, this.reverseSolution, false, outrec.path))
      return false;
    outrec.bounds = ClipperBase.getBoundsPath(outrec.path);
    return true;
  }
  checkSplitOwner(outrec, splits) {
    for (const i of splits) {
      const split = ClipperBase.getRealOutRec(this._outrecList[i]);
      if (split === void 0 || split === outrec || split.recursiveSplit === outrec)
        continue;
      split.recursiveSplit = outrec;
      if (split.splits !== void 0 && this.checkSplitOwner(outrec, split.splits))
        return true;
      if (ClipperBase.isValidOwner(outrec, split) && this.checkBounds(split) && split.bounds.containsRect(outrec.bounds) && ClipperBase.path1InsidePath2(outrec.pts, split.pts)) {
        outrec.owner = split;
        return true;
      }
    }
    return false;
  }
  recursiveCheckOwners(outrec, polypath) {
    if (outrec.polypath !== void 0 || outrec.bounds.isEmpty())
      return;
    while (outrec.owner !== void 0) {
      if (outrec.owner.splits !== void 0 && this.checkSplitOwner(outrec, outrec.owner.splits))
        break;
      else if (outrec.owner.pts !== void 0 && this.checkBounds(outrec.owner) && ClipperBase.path1InsidePath2(outrec.pts, outrec.owner.pts))
        break;
      outrec.owner = outrec.owner.owner;
    }
    if (outrec.owner !== void 0) {
      if (outrec.owner.polypath === void 0)
        this.recursiveCheckOwners(outrec.owner, polypath);
      outrec.polypath = outrec.owner.polypath.addChild(outrec.path);
    } else {
      outrec.polypath = polypath.addChild(outrec.path);
    }
  }
  buildTree(polytree, solutionOpen) {
    polytree.clear();
    solutionOpen.length = 0;
    let i = 0;
    while (i < this._outrecList.length) {
      const outrec = this._outrecList[i++];
      if (outrec.pts === void 0)
        continue;
      if (outrec.isOpen) {
        const open_path = new Path64();
        if (ClipperBase.buildPath(outrec.pts, this.reverseSolution, true, open_path))
          solutionOpen.push(open_path);
        continue;
      }
      if (this.checkBounds(outrec))
        this.recursiveCheckOwners(outrec, polytree);
    }
  }
  getBounds() {
    const bounds = Clipper.InvalidRect64;
    for (const t of this._vertexList) {
      let v = t;
      do {
        if (v.pt.x < bounds.left)
          bounds.left = v.pt.x;
        if (v.pt.x > bounds.right)
          bounds.right = v.pt.x;
        if (v.pt.y < bounds.top)
          bounds.top = v.pt.y;
        if (v.pt.y > bounds.bottom)
          bounds.bottom = v.pt.y;
        v = v.next;
      } while (v !== t);
    }
    return bounds.isEmpty() ? new Rect64(0, 0, 0, 0) : bounds;
  }
}
class Clipper64 extends ClipperBase {
  addPath(path, polytype, isOpen = false) {
    super.addPath(path, polytype, isOpen);
  }
  addReusableData(reusableData) {
    super.addReuseableData(reusableData);
  }
  addPaths(paths, polytype, isOpen = false) {
    super.addPaths(paths, polytype, isOpen);
  }
  addSubjectPaths(paths) {
    this.addPaths(paths, PathType.Subject);
  }
  addOpenSubjectPaths(paths) {
    this.addPaths(paths, PathType.Subject, true);
  }
  addClipPaths(paths) {
    this.addPaths(paths, PathType.Clip);
  }
  execute(clipType, fillRule, solutionClosed, solutionOpen = new Paths64()) {
    solutionClosed.length = 0;
    solutionOpen.length = 0;
    try {
      this.executeInternal(clipType, fillRule);
      this.buildPaths(solutionClosed, solutionOpen);
    } catch (error) {
      this._succeeded = false;
    }
    this.clearSolutionOnly();
    return this._succeeded;
  }
  executePolyTree(clipType, fillRule, polytree, openPaths = new Paths64()) {
    polytree.clear();
    openPaths.length = 0;
    this._using_polytree = true;
    try {
      this.executeInternal(clipType, fillRule);
      this.buildTree(polytree, openPaths);
    } catch (error) {
      this._succeeded = false;
    }
    this.clearSolutionOnly();
    return this._succeeded;
  }
}
var ClipType;
(function(ClipType2) {
  ClipType2[ClipType2["None"] = 0] = "None";
  ClipType2[ClipType2["Intersection"] = 1] = "Intersection";
  ClipType2[ClipType2["Union"] = 2] = "Union";
  ClipType2[ClipType2["Difference"] = 3] = "Difference";
  ClipType2[ClipType2["Xor"] = 4] = "Xor";
})(ClipType || (ClipType = {}));
var PathType;
(function(PathType2) {
  PathType2[PathType2["Subject"] = 0] = "Subject";
  PathType2[PathType2["Clip"] = 1] = "Clip";
})(PathType || (PathType = {}));
var FillRule;
(function(FillRule2) {
  FillRule2[FillRule2["EvenOdd"] = 0] = "EvenOdd";
  FillRule2[FillRule2["NonZero"] = 1] = "NonZero";
  FillRule2[FillRule2["Positive"] = 2] = "Positive";
  FillRule2[FillRule2["Negative"] = 3] = "Negative";
})(FillRule || (FillRule = {}));
var PipResult;
(function(PipResult2) {
  PipResult2[PipResult2["Inside"] = 0] = "Inside";
  PipResult2[PipResult2["Outside"] = 1] = "Outside";
  PipResult2[PipResult2["OnEdge"] = 2] = "OnEdge";
})(PipResult || (PipResult = {}));
class Path64 extends Array {
}
class Paths64 extends Array {
}
class Rect64 {
  constructor(lOrIsValidOrRec, t, r, b) {
    if (typeof lOrIsValidOrRec === "boolean") {
      if (lOrIsValidOrRec) {
        this.left = 0;
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
      } else {
        this.left = Number.MAX_SAFE_INTEGER;
        this.top = Number.MAX_SAFE_INTEGER;
        this.right = Number.MIN_SAFE_INTEGER;
        this.bottom = Number.MIN_SAFE_INTEGER;
      }
    } else if (typeof lOrIsValidOrRec === "number") {
      this.left = lOrIsValidOrRec;
      this.top = t;
      this.right = r;
      this.bottom = b;
    } else {
      this.left = lOrIsValidOrRec.left;
      this.top = lOrIsValidOrRec.top;
      this.right = lOrIsValidOrRec.right;
      this.bottom = lOrIsValidOrRec.bottom;
    }
  }
  get width() {
    return this.right - this.left;
  }
  set width(value) {
    this.right = this.left + value;
  }
  get height() {
    return this.bottom - this.top;
  }
  set height(value) {
    this.bottom = this.top + value;
  }
  isEmpty() {
    return this.bottom <= this.top || this.right <= this.left;
  }
  midPoint() {
    return new Point64((this.left + this.right) / 2, (this.top + this.bottom) / 2);
  }
  contains(pt) {
    return pt.x > this.left && pt.x < this.right && pt.y > this.top && pt.y < this.bottom;
  }
  containsRect(rec) {
    return rec.left >= this.left && rec.right <= this.right && rec.top >= this.top && rec.bottom <= this.bottom;
  }
  intersects(rec) {
    return Math.max(this.left, rec.left) <= Math.min(this.right, rec.right) && Math.max(this.top, rec.top) <= Math.min(this.bottom, rec.bottom);
  }
  asPath() {
    const result = new Path64();
    result.push(new Point64(this.left, this.top));
    result.push(new Point64(this.right, this.top));
    result.push(new Point64(this.right, this.bottom));
    result.push(new Point64(this.left, this.bottom));
    return result;
  }
}
class Point64 {
  constructor(xOrPt, yOrScale) {
    if (typeof xOrPt === "number" && typeof yOrScale === "number") {
      this.x = Math.round(xOrPt);
      this.y = Math.round(yOrScale);
    } else {
      const pt = xOrPt;
      if (yOrScale !== void 0) {
        this.x = Math.round(pt.x * yOrScale);
        this.y = Math.round(pt.y * yOrScale);
      } else {
        this.x = pt.x;
        this.y = pt.y;
      }
    }
  }
  static equals(lhs, rhs) {
    return lhs.x === rhs.x && lhs.y === rhs.y;
  }
  static notEquals(lhs, rhs) {
    return lhs.x !== rhs.x || lhs.y !== rhs.y;
  }
  static add(lhs, rhs) {
    return new Point64(lhs.x + rhs.x, lhs.y + rhs.y);
  }
  static subtract(lhs, rhs) {
    return new Point64(lhs.x - rhs.x, lhs.y - rhs.y);
  }
  toString() {
    return `${this.x},${this.y} `;
  }
  equals(obj) {
    if (obj instanceof Point64) {
      return Point64.equals(this, obj);
    }
    return false;
  }
}
class InternalClipper {
  static checkPrecision(precision) {
    if (precision < -8 || precision > 8)
      throw new Error(this.precision_range_error);
  }
  static isAlmostZero(value) {
    return Math.abs(value) <= this.floatingPointTolerance;
  }
  static crossProduct(pt1, pt2, pt3) {
    return (pt2.x - pt1.x) * (pt3.y - pt2.y) - (pt2.y - pt1.y) * (pt3.x - pt2.x);
  }
  static dotProduct(pt1, pt2, pt3) {
    return (pt2.x - pt1.x) * (pt3.x - pt2.x) + (pt2.y - pt1.y) * (pt3.y - pt2.y);
  }
  static checkCastInt64(val) {
    if (val >= this.max_coord || val <= this.min_coord)
      return this.Invalid64;
    return Math.round(val);
  }
  static getIntersectPt(ln1a, ln1b, ln2a, ln2b) {
    const dy1 = ln1b.y - ln1a.y;
    const dx1 = ln1b.x - ln1a.x;
    const dy2 = ln2b.y - ln2a.y;
    const dx2 = ln2b.x - ln2a.x;
    const det = dy1 * dx2 - dy2 * dx1;
    let ip;
    if (det === 0) {
      ip = new Point64(0, 0);
      return { ip, success: false };
    }
    const t = ((ln1a.x - ln2a.x) * dy2 - (ln1a.y - ln2a.y) * dx2) / det;
    if (t <= 0)
      ip = ln1a;
    else if (t >= 1)
      ip = ln1b;
    else
      ip = new Point64(ln1a.x + t * dx1, ln1a.y + t * dy1);
    return { ip, success: true };
  }
  static getIntersectPoint(ln1a, ln1b, ln2a, ln2b) {
    const dy1 = ln1b.y - ln1a.y;
    const dx1 = ln1b.x - ln1a.x;
    const dy2 = ln2b.y - ln2a.y;
    const dx2 = ln2b.x - ln2a.x;
    const det = dy1 * dx2 - dy2 * dx1;
    let ip;
    if (det === 0) {
      ip = new Point64(0, 0);
      return { ip, success: false };
    }
    const t = ((ln1a.x - ln2a.x) * dy2 - (ln1a.y - ln2a.y) * dx2) / det;
    if (t <= 0)
      ip = ln1a;
    else if (t >= 1)
      ip = ln2a;
    else
      ip = new Point64(ln1a.x + t * dx1, ln1a.y + t * dy1);
    return { ip, success: true };
  }
  static segsIntersect(seg1a, seg1b, seg2a, seg2b, inclusive = false) {
    if (inclusive) {
      const res1 = InternalClipper.crossProduct(seg1a, seg2a, seg2b);
      const res2 = InternalClipper.crossProduct(seg1b, seg2a, seg2b);
      if (res1 * res2 > 0)
        return false;
      const res3 = InternalClipper.crossProduct(seg2a, seg1a, seg1b);
      const res4 = InternalClipper.crossProduct(seg2b, seg1a, seg1b);
      if (res3 * res4 > 0)
        return false;
      return res1 !== 0 || res2 !== 0 || res3 !== 0 || res4 !== 0;
    } else {
      return InternalClipper.crossProduct(seg1a, seg2a, seg2b) * InternalClipper.crossProduct(seg1b, seg2a, seg2b) < 0 && InternalClipper.crossProduct(seg2a, seg1a, seg1b) * InternalClipper.crossProduct(seg2b, seg1a, seg1b) < 0;
    }
  }
  static getClosestPtOnSegment(offPt, seg1, seg2) {
    if (seg1.x === seg2.x && seg1.y === seg2.y)
      return seg1;
    const dx = seg2.x - seg1.x;
    const dy = seg2.y - seg1.y;
    let q = ((offPt.x - seg1.x) * dx + (offPt.y - seg1.y) * dy) / (dx * dx + dy * dy);
    if (q < 0)
      q = 0;
    else if (q > 1)
      q = 1;
    return new Point64(seg1.x + Math.round(q * dx), seg1.y + Math.round(q * dy));
  }
  static pointInPolygon(pt, polygon) {
    const len = polygon.length;
    let start = 0;
    if (len < 3)
      return PointInPolygonResult.IsOutside;
    while (start < len && polygon[start].y === pt.y)
      start++;
    if (start === len)
      return PointInPolygonResult.IsOutside;
    let d = 0;
    let isAbove = polygon[start].y < pt.y;
    const startingAbove = isAbove;
    let val = 0;
    let i = start + 1;
    let end = len;
    for (; ; ) {
      if (i === end) {
        if (end === 0 || start === 0)
          break;
        end = start;
        i = 0;
      }
      if (isAbove) {
        while (i < end && polygon[i].y < pt.y)
          i++;
        if (i === end)
          continue;
      } else {
        while (i < end && polygon[i].y > pt.y)
          i++;
        if (i === end)
          continue;
      }
      const curr = polygon[i];
      const prev = i > 0 ? polygon[i - 1] : polygon[len - 1];
      if (curr.y === pt.y) {
        if (curr.x === pt.x || curr.y === prev.y && pt.x < prev.x !== pt.x < curr.x)
          return PointInPolygonResult.IsOn;
        i++;
        if (i === start)
          break;
        continue;
      }
      if (pt.x < curr.x && pt.x < prev.x) ;
      else if (pt.x > prev.x && pt.x > curr.x) {
        val = 1 - val;
      } else {
        d = InternalClipper.crossProduct(prev, curr, pt);
        if (d === 0)
          return PointInPolygonResult.IsOn;
        if (d < 0 === isAbove)
          val = 1 - val;
      }
      isAbove = !isAbove;
      i++;
    }
    if (isAbove !== startingAbove) {
      if (i === len)
        i = 0;
      else
        d = InternalClipper.crossProduct(polygon[i - 1], polygon[i], pt);
      if (d === 0)
        return PointInPolygonResult.IsOn;
      if (d < 0 === isAbove)
        val = 1 - val;
    }
    if (val === 0)
      return PointInPolygonResult.IsOutside;
    return PointInPolygonResult.IsInside;
  }
}
InternalClipper.MaxInt64 = 9223372036854776e3;
InternalClipper.MaxCoord = InternalClipper.MaxInt64 / 4;
InternalClipper.max_coord = InternalClipper.MaxCoord;
InternalClipper.min_coord = -InternalClipper.MaxCoord;
InternalClipper.Invalid64 = InternalClipper.MaxInt64;
InternalClipper.defaultArcTolerance = 0.25;
InternalClipper.floatingPointTolerance = 1e-12;
InternalClipper.defaultMinimumEdgeLength = 0.1;
InternalClipper.precision_range_error = "Error: Precision is out of range.";
const DIRECTION_EPSILON = 1e-3;
const DIST_EPSILON = 100;
function sameDirection(p0, p1, p2) {
  const dx1 = p1.x - p0.x;
  const dy1 = p1.y - p0.y;
  const dx2 = p2.x - p1.x;
  const dy2 = p2.y - p1.y;
  const s1 = dx1 / dy1;
  const s2 = dx2 / dy2;
  return Math.abs(s1 - s2) < DIRECTION_EPSILON;
}
function areClose(p0, p1) {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  return Math.sqrt(dx * dx + dy * dy) < DIST_EPSILON;
}
function areEqual(p0, p1) {
  return p0.x === p1.x && p0.y === p1.y;
}
function compressPoints(points) {
  for (let k = 0; k < points.length; k++) {
    const v = points[k];
    while (true) {
      const k1 = k + 1;
      if (points.length > k1 && (areEqual(v, points[k1]) || areClose(v, points[k1]))) {
        points.splice(k1, 1);
      } else {
        break;
      }
    }
    while (true) {
      const k1 = k + 1;
      const k2 = k + 2;
      if (points.length > k2 && sameDirection(v, points[k1], points[k2])) {
        points.splice(k + 1, 1);
      } else {
        break;
      }
    }
  }
}
function xzToXzCopy(v, target) {
  target.x = v.x;
  target.y = v.z;
}
function epsEquals(a, b) {
  return Math.abs(a - b) <= 500;
}
function vectorEpsEquals(v0, v1) {
  return epsEquals(v0.x, v1.x) && epsEquals(v0.y, v1.y) && epsEquals(v0.z, v1.z);
}
function triangleIsInsidePaths(tri, paths) {
  const indices = ["a", "b", "c"];
  const edges = [new Line3(), new Line3(), new Line3()];
  const line = new Line3();
  const ray = new Line3();
  ray.start.set(0, 0, 0).addScaledVector(tri.a, 1 / 3).addScaledVector(tri.b, 1 / 3).addScaledVector(tri.c, 1 / 3);
  xzToXzCopy(ray.start, ray.start);
  ray.end.copy(ray.start);
  ray.end.y += 1e10;
  for (let i = 0; i < 3; i++) {
    const i1 = (i + 1) % 3;
    const p0 = tri[indices[i]];
    const p1 = tri[indices[i1]];
    const edge = edges[i];
    xzToXzCopy(p0, edge.start);
    xzToXzCopy(p1, edge.end);
  }
  let crossCount = 0;
  for (let p = 0, pl = paths.length; p < pl; p++) {
    const points = paths[p];
    for (let i = 0, l = points.length; i < l; i++) {
      const i1 = (i + 1) % l;
      line.start.copy(points[i]);
      line.start.z = 0;
      line.end.copy(points[i1]);
      line.end.z = 0;
      if (lineCrossesLine(ray, line)) {
        crossCount++;
      }
      for (let e = 0; e < 3; e++) {
        const edge = edges[e];
        if (lineCrossesLine(edge, line) || vectorEpsEquals(edge.start, line.start) || vectorEpsEquals(edge.end, line.end) || vectorEpsEquals(edge.end, line.start) || vectorEpsEquals(edge.start, line.end)) {
          return false;
        }
      }
    }
  }
  return crossCount % 2 === 1;
}
function lineCrossesLine(l1, l2) {
  function ccw(A2, B2, C2) {
    return (C2.y - A2.y) * (B2.x - A2.x) > (B2.y - A2.y) * (C2.x - A2.x);
  }
  const A = l1.start;
  const B = l1.end;
  const C = l2.start;
  const D = l2.end;
  return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
}
const AREA_EPSILON = 1e-8;
const UP_VECTOR = /* @__PURE__ */ new Vector3(0, 1, 0);
const _tri = /* @__PURE__ */ new Triangle();
const _normal = /* @__PURE__ */ new Vector3();
const _center = /* @__PURE__ */ new Vector3();
const _vec = /* @__PURE__ */ new Vector3();
function convertPathToGeometry(path, scale) {
  const vector2s = path.map((points) => {
    return points.flatMap((v) => new Vector2(v.x / scale, v.y / scale));
  });
  const holesShapes = vector2s.filter((p) => ShapeUtils.isClockWise(p)).map((p) => new Shape(p));
  const solidShapes = vector2s.filter((p) => !ShapeUtils.isClockWise(p)).map((p) => {
    const shape = new Shape(p);
    shape.holes = holesShapes;
    return shape;
  });
  const result = new ShapeGeometry(solidShapes).rotateX(Math.PI / 2);
  result.index.array.reverse();
  return result;
}
function convertPathToLineSegments(path, scale) {
  const arr = [];
  path.forEach((points) => {
    for (let i = 0, l = points.length; i < l; i++) {
      const i1 = (i + 1) % points.length;
      const p0 = points[i];
      const p1 = points[i1];
      arr.push(
        new Vector3(p0.x / scale, 0, p0.y / scale),
        new Vector3(p1.x / scale, 0, p1.y / scale)
      );
    }
  });
  const result = new BufferGeometry();
  result.setFromPoints(arr);
  return result;
}
const OUTPUT_MESH = 0;
const OUTPUT_LINE_SEGMENTS = 1;
const OUTPUT_BOTH = 2;
class SilhouetteGenerator {
  constructor() {
    this.iterationTime = 30;
    this.intScalar = 1e9;
    this.doubleSided = false;
    this.sortTriangles = false;
    this.output = OUTPUT_MESH;
  }
  generateAsync(geometry, options = {}) {
    return new Promise((resolve, reject) => {
      const { signal } = options;
      const task = this.generate(geometry, options);
      run();
      function run() {
        if (signal && signal.aborted) {
          reject(new Error("SilhouetteGenerator: Process aborted via AbortSignal."));
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
  *generate(geometry, options = {}) {
    const { iterationTime, intScalar, doubleSided, output, sortTriangles } = this;
    const { onProgress } = options;
    const power = Math.log10(intScalar);
    const extendMultiplier = Math.pow(10, -(power - 2));
    const index = geometry.index;
    const posAttr = geometry.attributes.position;
    const triCount = getTriCount(geometry);
    let overallPath = null;
    const triList = sortTriangles ? getSizeSortedTriList(geometry) : new Array(triCount).fill().map((v, i) => i);
    const handle = {
      getGeometry() {
        if (output === OUTPUT_MESH) {
          return convertPathToGeometry(overallPath, intScalar);
        } else if (output === OUTPUT_LINE_SEGMENTS) {
          return convertPathToLineSegments(overallPath, intScalar);
        } else {
          return [
            convertPathToGeometry(overallPath, intScalar),
            convertPathToLineSegments(overallPath, intScalar)
          ];
        }
      }
    };
    let time = performance.now();
    for (let ti = 0; ti < triCount; ti++) {
      const i = triList[ti] * 3;
      let i0 = i + 0;
      let i1 = i + 1;
      let i2 = i + 2;
      if (index) {
        i0 = index.getX(i0);
        i1 = index.getX(i1);
        i2 = index.getX(i2);
      }
      const { a, b, c } = _tri;
      a.fromBufferAttribute(posAttr, i0);
      b.fromBufferAttribute(posAttr, i1);
      c.fromBufferAttribute(posAttr, i2);
      if (!doubleSided) {
        _tri.getNormal(_normal);
        if (_normal.dot(UP_VECTOR) < 0) {
          continue;
        }
      }
      a.y = 0;
      b.y = 0;
      c.y = 0;
      if (_tri.getArea() < AREA_EPSILON) {
        continue;
      }
      _center.copy(a).add(b).add(c).multiplyScalar(1 / 3);
      _vec.subVectors(a, _center).normalize();
      a.addScaledVector(_vec, extendMultiplier);
      _vec.subVectors(b, _center).normalize();
      b.addScaledVector(_vec, extendMultiplier);
      _vec.subVectors(c, _center).normalize();
      c.addScaledVector(_vec, extendMultiplier);
      const path = new Path64();
      path.push(Clipper.makePath([
        a.x * intScalar,
        a.z * intScalar,
        b.x * intScalar,
        b.z * intScalar,
        c.x * intScalar,
        c.z * intScalar
      ]));
      a.multiplyScalar(intScalar);
      b.multiplyScalar(intScalar);
      c.multiplyScalar(intScalar);
      if (overallPath && triangleIsInsidePaths(_tri, overallPath)) {
        continue;
      }
      if (overallPath === null) {
        overallPath = path;
      } else {
        overallPath = Clipper.Union(overallPath, path, FillRule.NonZero);
        overallPath.forEach((path2) => compressPoints(path2));
      }
      const delta = performance.now() - time;
      if (delta > iterationTime) {
        if (onProgress) {
          const progress = ti / triCount;
          onProgress(progress, handle);
        }
        yield;
        time = performance.now();
      }
    }
    return handle.getGeometry();
  }
}
export {
  OUTPUT_BOTH as O,
  SilhouetteGenerator as S
};
//# sourceMappingURL=SilhouetteGenerator-BthsVxbf.js.map
