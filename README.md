# three-edge-projection


[![build](https://img.shields.io/github/actions/workflow/status/gkjohnson/three-edge-projection/node.js.yml?style=flat-square&label=build&branch=main)](https://github.com/gkjohnson/three-edge-projection/actions)
[![docs](https://img.shields.io/badge/docs-API-blue?style=flat-square)](https://gkjohnson.github.io/tools/docs/three-edge-projection/)
[![github](https://flat.badgen.net/badge/icon/github?icon=github&label)](https://github.com/gkjohnson/three-edge-projection/)
[![twitter](https://flat.badgen.net/badge/twitter/@garrettkjohnson/?icon&label)](https://twitter.com/garrettkjohnson)
[![sponsors](https://img.shields.io/github/sponsors/gkjohnson?style=flat-square&color=1da1f2)](https://github.com/sponsors/gkjohnson/)

![](./docs/banner.png)

Edge projection based on [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh/) to extract visible projected lines along the y-axis into flattened line segments for scalable 2d rendering. Additonally includes a silhouette mesh generator based on [clipper2-js](https://www.npmjs.com/package/clipper2-js) to merge flattened triangles.

# Examples

[Rover edge projection](https://gkjohnson.github.io/three-edge-projection/edgeProjection.html)

[Lego edge projection](https://gkjohnson.github.io/three-edge-projection/edgeProjection.html#lego)

[Silhouette projection](https://gkjohnson.github.io/three-edge-projection/silhouetteProjection.html)

[Floor plan projection](https://gkjohnson.github.io/three-edge-projection/floorProjection.html)

[Planar intersection](https://gkjohnson.github.io/three-edge-projection/planarIntersection.html)

### WebGPU

[Rover edge projection](https://gkjohnson.github.io/three-edge-projection/edgeProjectionWebGPU.html)

# Installation

```
npm install github:@gkjohnson/three-edge-projection
```

# API

See [API.md](./API.md) for full API documentation.

The same documentation is also available on the [docs site](https://gkjohnson.github.io/tools/docs/three-edge-projection/).

# Use

**Generator**

More granular API with control over when edge trimming work happens.

```js
const generator = new ProjectionGenerator();
generator.generate( scene );

let result = task.next();
while ( ! result.done ) {

	result = task.next();

}

const lines = new LineSegments( result.value.getVisibleLineGeometry(), material );
scene.add( lines );
```

**Promise**

Simpler API with less control over when the work happens.

```js
const generator = new ProjectionGenerator();
const result = await generator.generateAsync( scene );
const mesh = new Mesh( result.getVisibleLineGeometry(), material );
scene.add( mesh );
```

**Visibility Culling**

To visibility cull a scene before generation you can use MeshVisibilityCuller before running the projection step.

```js
const input = new MeshVisibilityCuller( renderer ).cull( scene );
const result = await generator.generateAsync( scene );
const mesh = new Mesh( result.getVisibleLineGeometry(), material );
scene.add( mesh );
```
