# three-edge-projection

Edge projection system based on [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh/) to extract visible projected lines along the y-axis.

# Examples

TODO

# Use

```js
const generator = new ProjectionGenerator();
generator.generate( geometry );

let result = task.next();
while ( ! result.done ) {

	result = task.next();

}

const mesh = new Mesh( result.value, material );
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
iterationTime = 10 : Number
```

How long to spend trimming edges before yielding.

### .generate

```js
*generate(
	geometry : MeshBVH | BufferGeometry,
	options : {
		onProgress: ( percent : Number ) => void,
	}
) : BufferGeometry
```

Generate the geometry using a generator function.
