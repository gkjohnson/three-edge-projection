import { T as Triangle, L as Line3, V as Vector3, P as Plane, n as BufferGeometry, ad as MeshBVH, o as BufferAttribute } from "./bvhcastEdges-BzgT52m-.js";
function getTriCount(geometry) {
  const { index } = geometry;
  const posAttr = geometry.attributes.position;
  return index ? index.count / 3 : posAttr.count / 3;
}
const _tri = new Triangle();
function getSizeSortedTriList(geometry) {
  const index = geometry.index;
  const posAttr = geometry.attributes.position;
  const triCount = getTriCount(geometry);
  return new Array(triCount).fill().map((v, i) => {
    let i0 = i * 3 + 0;
    let i1 = i * 3 + 1;
    let i2 = i * 3 + 2;
    if (index) {
      i0 = index.getX(i0);
      i1 = index.getX(i1);
      i2 = index.getX(i2);
    }
    _tri.a.fromBufferAttribute(posAttr, i0);
    _tri.b.fromBufferAttribute(posAttr, i1);
    _tri.c.fromBufferAttribute(posAttr, i2);
    _tri.a.y = 0;
    _tri.b.y = 0;
    _tri.c.y = 0;
    return {
      area: _tri.getArea(),
      index: i
    };
  }).sort((a, b) => {
    return b.area - a.area;
  }).map((o) => {
    return o.index;
  });
}
const _line = new Line3();
const _target = new Line3();
const _vec = new Vector3();
const EPS = 1e-16;
class PlanarIntersectionGenerator {
  constructor() {
    this.plane = new Plane(new Vector3(0, 1, 0), 0);
  }
  generate(bvh) {
    const { plane } = this;
    if (bvh instanceof BufferGeometry) {
      bvh = new MeshBVH(bvh, { maxLeafSize: 1 });
    }
    const edgesArray = [];
    bvh.shapecast({
      intersectsBounds: (box) => {
        return plane.intersectsBox(box);
      },
      intersectsTriangle: (tri) => {
        const { points } = tri;
        let foundPoints = 0;
        for (let i = 0; i < 3; i++) {
          const ni = (i + 1) % 3;
          _line.start.copy(points[i]);
          _line.end.copy(points[ni]);
          if (plane.intersectLine(_line, _vec)) {
            if (foundPoints === 1) {
              if (_vec.distanceTo(_target.start) > EPS) {
                _target.end.copy(_vec);
                foundPoints++;
                break;
              }
            } else {
              _target.start.copy(_vec);
              foundPoints++;
            }
          }
        }
        if (foundPoints === 2) {
          edgesArray.push(..._target.start, ..._target.end);
        }
      }
    });
    const edgeGeom = new BufferGeometry();
    const edgeBuffer = new BufferAttribute(new Float32Array(edgesArray), 3, true);
    edgeGeom.setAttribute("position", edgeBuffer);
    return edgeGeom;
  }
}
export {
  PlanarIntersectionGenerator as P,
  getSizeSortedTriList as a,
  getTriCount as g
};
//# sourceMappingURL=PlanarIntersectionGenerator-BzRVJOaf.js.map
