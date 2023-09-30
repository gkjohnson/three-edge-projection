import { Line3 } from 'three';
import { ExtendedTriangle } from 'three-mesh-bvh';
import { isLineTriangleEdge } from './triangleLineUtils.js';

const OFFSET_EPSILON = 1e-6;
const _tri = new ExtendedTriangle();
const _line = new Line3();
export function* generateIntersectionEdges( bvh, iterationTime = 30 ) {

	const edges = [];
	const geometry = bvh.geometry;
	const index = geometry.index;
	const posAttr = geometry.attributes.position;
	const vertCount = index ? index.count : posAttr;

	let time = performance.now();
	for ( let i = 0; i < vertCount; i += 3 ) {

		let i0 = i + 0;
		let i1 = i + 1;
		let i2 = i + 2;
		if ( index ) {

			i0 = index.getX( i0 );
			i1 = index.getX( i1 );
			i2 = index.getX( i2 );

		}

		const { a, b, c } = _tri;
		a.fromBufferAttribute( posAttr, i0 );
		b.fromBufferAttribute( posAttr, i1 );
		c.fromBufferAttribute( posAttr, i2 );
		_tri.needsUpdate = true;
		_tri.update();

		bvh.shapecast( {

			intersectsBounds: box => {

				return box.intersectsTriangle( _tri );

			},

			intersectsTriangle: tri2 => {

				if ( _tri.equals( tri2 ) ) {

					return false;

				}

				if ( tri2.needsUpdate ) {

					tri2.update();

				}

				if ( Math.abs( _tri.plane.normal.dot( tri2.plane.normal ) ) > 1 - 1e-6 ) {

					return false;

				}

				if (
					_tri.intersectsTriangle( tri2, _line, true ) &&
					! isLineTriangleEdge( _tri, _line ) &&
					! isLineTriangleEdge( tri2, _line )
				) {

					_line.start.y += OFFSET_EPSILON;
					_line.end.y += OFFSET_EPSILON;
					edges.push( _line.clone() );

				}

			},

		} );

		const delta = performance.now() - time;
		if ( delta > iterationTime ) {

			yield;
			time = performance.now();

		}

	}

	return edges;

}
