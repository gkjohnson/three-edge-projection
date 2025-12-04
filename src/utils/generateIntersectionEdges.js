import { Line3 } from 'three';
import { isLineTriangleEdge } from './triangleLineUtils.js';

// TODO: How can we add support for "iterationTime"?

const OFFSET_EPSILON = 1e-6;
const _line = new Line3();
export function generateIntersectionEdges( bvhA, bvhB, matrixBToA, target = [] ) {

	bvhA.bvhcast( bvhB, matrixBToA, {
		intersectsTriangles: ( tri1, tri2 ) => {

			if ( tri1.equals( tri2 ) ) {

				return;

			}

			if ( tri1.needsUpdate ) {

				tri1.update();

			}

			if ( tri2.needsUpdate ) {

				tri2.update();

			}

			if ( Math.abs( tri1.plane.normal.dot( tri2.plane.normal ) ) > 1 - 1e-6 ) {

				return false;

			}

			if (
				tri1.intersectsTriangle( tri2, _line, true ) &&
				! isLineTriangleEdge( tri1, _line ) &&
				! isLineTriangleEdge( tri2, _line )
			) {

				_line.start.y += OFFSET_EPSILON;
				_line.end.y += OFFSET_EPSILON;
				target.push( _line.clone() );

			}

		}

	} );

	return target;

}
