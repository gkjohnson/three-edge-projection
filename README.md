# three-edge-projection


[![build](https://img.shields.io/github/actions/workflow/status/gkjohnson/three-edge-projection/node.js.yml?style=flat-square&label=build&branch=main)](https://github.com/gkjohnson/three-edge-projection/actions)
[![github](https://flat.badgen.net/badge/icon/github?icon=github&label)](https://github.com/gkjohnson/three-edge-projection/)
[![twitter](https://flat.badgen.net/badge/twitter/@garrettkjohnson/?icon&label)](https://twitter.com/garrettkjohnson)
[![sponsors](https://img.shields.io/github/sponsors/gkjohnson?style=flat-square&color=1da1f2)](https://github.com/sponsors/gkjohnson/)

![](./docs/banner.png)

Edge projection based on [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh/) to extract visible projected lines along the y-axis into flattened line segments for scalable 2d rendering. Additonally includes a silhouette mesh generator based on [clipper2-js](https://www.npmjs.com/package/clipper2-js) to merge flattened triangles.

# Examples

[Rover edge projection](https://gkjohnson.github.io/three-edge-projection/example/dist/edgeProjection.html)

[Lego edge projection](https://gkjohnson.github.io/three-edge-projection/example/dist/edgeProjection.html#lego)

[Silhouette projection](https://gkjohnson.github.io/three-edge-projection/example/dist/silhouetteProjection.html)

[Floor plan projection](https://gkjohnson.github.io/three-edge-projection/example/dist/floorProjection.html)

[Planar intersection](https://gkjohnson.github.io/three-edge-projection/example/dist/planarIntersection.html)

# Use

**Generator**

More granular API with control over when edge trimming work happens.

```js
const generator = new ProjectionGenerator();
generator.generate( geometry );

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
const result = await generator.generateAsync( geometry );
const mesh = new Mesh( result.getVisibleLineGeometry(), material );
scene.add( mesh );
```


# API

## ProjectionGenerator

### .sortEdges

```js
sortEdges = true : Boolean
```

Whether to sort edges along the Y axis before iterating over the edges.

### .iterationTime

```js
iterationTime = 30 : Number
```

How long to spend trimming edges before yielding.

### .angleThreshold

```js
angleThreshold = 50 : Number
```

The threshold angle in degrees at which edges are generated.

### .includeIntersectionEdges

```js
includeIntersectionEdges = true : Boolean
```

Whether to generate edges representing the intersections between triangles.

### .generate

```js
*generate(
	geometry: Object3D | BufferGeometry,
	options: {
		onProgress: ( message: string ) => void,
	}
): {
	getVisibleLineGeometry(): BufferGeometry,
	getHiddenLineGeometry(): BufferGeometry,
}
```

Generate the edge geometry using a generator function.

### .generateAsync

```js
generateAsync(
	geometry: Object3D | BufferGeometry,
	options: {
		onProgress: ( message: string ) => void,
		signal: AbortSignal,
	}
): Promise<{
	getVisibleLineGeometry(): BufferGeometry,
	getHiddenLineGeometry(): BufferGeometry,
}>
```

Generate the geometry with a promise-style API.

## MeshVisibilityCuller

Utility for determining visible geometry from a top down orthographic perspective. This can be run before performing projection generation to reduce the complexity of the operation at the cost of potentially missing small details.

### .pixelsPerMeter

```js
pixelsPerMeter: number = 0.1
```

The size of a pixel on a single dimension. If this results in a texture larger than what the graphics context can provide then the rendering is tiled.

### constructor

```js
constructor( renderer: WebGLRenderer, options = {} )
```

Constructor for the visibility culler that takes the renderer to use for culling.


## SilhouetteGenerator

Used for generating a projected silhouette of a geometry using the [clipper2-js](https://www.npmjs.com/package/clipper2-js) project. Performing these operations can be extremely slow with more complex geometry and not always yield a stable result.

### .iterationTime

```js
iterationTime = 10 : Number
```

How long to spend trimming edges before yielding.

### .doubleSided

```js
doubleSided = false : Boolean
```

If `false` then only the triangles facing upwards are included in the silhouette.

### .sortTriangles

```js
sortTriangles = false : Boolean
```

Whether to sort triangles and project them large-to-small. In some cases this can cause the performance to drop since the union operation is best performed with smooth, simple edge shapes.

### .output

```js
output = OUTPUT_MESH | OUTPUT_LINE_SEGMENTS | OUTPUT_BOTH
```

Whether to output mesh geometry, line segments geometry, or both in an array ( `[ mesh, line segments ]` );

### .generate

```js
*generate(
	geometry : BufferGeometry,
	options : {
		onProgress: ( percent : Number ) => void,
	}
) : BufferGeometry
```

Generate the geometry using a generator function.

### .generateAsync

```js
generateAsync(
	geometry : BufferGeometry,
	options : {
		onProgress: ( percent : Number ) => void,
		signal: AbortSignal,
	}
) : Promise<BufferGeometry>
```

Generate the silhouette geometry with a promise-style API.

## PlanarIntersectionGenerator

### .plane

```js
plane : Plane
```

Plane that defaults to y up plane at the origin.

### .generate

```js
generate( geometry : MeshBVH | BufferGeometry ) : BufferGeometry
```

Generates a geometry of the resulting line segments from the planar intersection.
