import { getProjectedLineOverlap } from '../src/utils/getProjectedLineOverlap.js';
import { ExtendedTriangle } from 'three-mesh-bvh';
import { Vector3, Line3 } from 'three';

describe( 'getProjectedLineOverlap', () => {

	it( 'should return portion of the line that overlaps on projection.', () => {

		const triangle = new ExtendedTriangle(
			new Vector3( 1, 0, 1 ),
			new Vector3( - 1, 1, 0 ),
			new Vector3( 1, 0, - 1 ),
		);

		let line, target;
		target = new Line3();
		line = new Line3( new Vector3( 2, - 1, 0 ), new Vector3( - 2, 1, 0 ) );

		expect( getProjectedLineOverlap( line, triangle, target ) ).toBeTruthy();
		expect( [ ...target.start ] ).toEqual( [ 1, - 0.5, 0 ] );
		expect( [ ...target.end ] ).toEqual( [ - 1, 0.5, 0 ] );

	} );

	it( 'should return null if there is no overlap.', () => {

		const triangle = new ExtendedTriangle(
			new Vector3( 1, 0, 1 ),
			new Vector3( - 1, 1, 0 ),
			new Vector3( 1, 0, - 1 ),
		);

		let line, target;
		target = new Line3();
		line = new Line3( new Vector3( 3, - 1, 0 ), new Vector3( 1, 1, 0 ) );

		expect( getProjectedLineOverlap( line, triangle, target ) ).toBeFalsy();

	} );

} );
