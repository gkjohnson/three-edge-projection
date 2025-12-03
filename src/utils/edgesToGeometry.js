import { BufferGeometry, BufferAttribute } from 'three';

export function edgesToGeometry( edges, heightOffset = 1e3 ) {

	const edgeCount = edges.length;
	const vertexCount = edgeCount * 3;
	const positions = new Float32Array( vertexCount * 3 );
	const edgeIndices = new Int32Array( vertexCount );

	let positionIndex = 0;
	for ( let i = 0; i < edgeCount; i ++ ) {

		const edge = edges[ i ];
		const { start, end } = edge;

		edgeIndices[ i * 3 + 0 ] = i;
		edgeIndices[ i * 3 + 1 ] = i;
		edgeIndices[ i * 3 + 2 ] = i;

		// Vertex 0: start of edge
		positions[ positionIndex ++ ] = start.x;
		positions[ positionIndex ++ ] = start.y;
		positions[ positionIndex ++ ] = start.z;

		// Vertex 1: end of edge
		positions[ positionIndex ++ ] = end.x;
		positions[ positionIndex ++ ] = end.y;
		positions[ positionIndex ++ ] = end.z;

		// Vertex 2: duplicate of start (creates degenerate triangle)
		positions[ positionIndex ++ ] = start.x;
		positions[ positionIndex ++ ] = start.y + heightOffset;
		positions[ positionIndex ++ ] = start.z;

	}

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'edgeIndices', new BufferAttribute( edgeIndices, 1, false ) );

	return geometry;

}
