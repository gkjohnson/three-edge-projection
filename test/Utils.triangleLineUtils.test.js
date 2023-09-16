import { Line3, Vector3 } from 'three';
import { ExtendedTriangle } from 'three-mesh-bvh';
import { isYProjectedTriangleDegenerate, isLineTriangleEdge } from '../src/utils/triangleLineUtils.js';

describe( 'isYProjectedTriangleDegenerate', () => {

	it( 'should return that a vertical triangle is degenerate.', () => {

		const triangle = new ExtendedTriangle(
			new Vector3( 1, 1, 0 ),
			new Vector3( 0, 0, 0 ),
			new Vector3( 1, - 1, 0 ),
		);
		expect( isYProjectedTriangleDegenerate( triangle ) ).toBe( true );

	} );

	it( 'should return that an almost vertical triangle is degenerate.', () => {

		const triangle = new ExtendedTriangle(
			new Vector3( 1, 1, 1e-16 ),
			new Vector3( 0, 0, 0 ),
			new Vector3( 1, - 1, - 1e-16 ),
		);
		expect( isYProjectedTriangleDegenerate( triangle ) ).toBe( true );

	} );

	it( 'should return that a non vertical triangle is not degenerate.', () => {

		const triangle = new ExtendedTriangle(
			new Vector3( 1, 1, 1 ),
			new Vector3( 0, 0, 0 ),
			new Vector3( 1, - 1, - 1 ),
		);
		expect( isYProjectedTriangleDegenerate( triangle ) ).toBe( false );

	} );

} );

describe( 'isLineTriangleEdge', () => {

	it( 'should return true if the line is on the triangle edge.', () => {

		const triangle = new ExtendedTriangle(
			new Vector3( 1, 1, 1 ),
			new Vector3( 0, 0, 0 ),
			new Vector3( 1, - 1, - 1 ),
		);

		let l1, l2, l3;
		l1 = new Line3( triangle.a, triangle.b );
		l2 = new Line3( triangle.b, triangle.c );
		l3 = new Line3( triangle.c, triangle.a );
		expect( isLineTriangleEdge( triangle, l1 ) ).toBe( true );
		expect( isLineTriangleEdge( triangle, l2 ) ).toBe( true );
		expect( isLineTriangleEdge( triangle, l3 ) ).toBe( true );

		l1 = new Line3( triangle.b, triangle.a );
		l2 = new Line3( triangle.c, triangle.b );
		l3 = new Line3( triangle.a, triangle.c );
		expect( isLineTriangleEdge( triangle, l1 ) ).toBe( true );
		expect( isLineTriangleEdge( triangle, l2 ) ).toBe( true );
		expect( isLineTriangleEdge( triangle, l3 ) ).toBe( true );

	} );

	it( 'should return false if the line is not on the triangle edge.', () => {

		const triangle = new ExtendedTriangle(
			new Vector3( 1, 1, 1 ),
			new Vector3( 0, 0, 0 ),
			new Vector3( 1, - 1, - 1 ),
		);

		const line = new Line3( new Vector3( 0, 0, 1 ), new Vector3( 0, 0, - 1 ) );
		expect( isLineTriangleEdge( triangle, line ) ).toBe( false );

	} );

} );
