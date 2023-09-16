import { ExtendedTriangle } from 'three-mesh-bvh';
import { trimToBeneathTriPlane } from '../src/utils/trimBeneathTriPlane.js';
import { Vector3, Line3 } from 'three';

describe( 'trimBeneathTriPlane', () => {

	it( 'should trim a line to beneath the triangle.', () => {

		const triangle = new ExtendedTriangle(
			new Vector3( 1, 0, 0 ),
			new Vector3( 0, 0, 1 ),
			new Vector3( - 1, 0, 0 ),
		);

		let line, target, vec;
		vec = new Vector3();
		target = new Line3();
		line = new Line3( new Vector3( 0, - 1, 0.5 ), new Vector3( 0, 1, 0.5 ) );

		expect( trimToBeneathTriPlane( triangle, line, target ) ).toBe( true );
		expect( target.distance() ).toBe( 1 );
		expect( target.at( 0.5, vec ).y ).toBeLessThan( 0 );
		expect( triangle.getNormal( vec ).y ).toBe( - 1 );

	} );

	it( 'should trim a line to beneath the triangle if flipped.', () => {

		const triangle = new ExtendedTriangle(
			new Vector3( - 1, 0, 0 ),
			new Vector3( 0, 0, 1 ),
			new Vector3( 1, 0, 0 ),
		);

		let line, target, vec;
		vec = new Vector3();
		target = new Line3();
		line = new Line3( new Vector3( 0, - 1, 0.5 ), new Vector3( 0, 1, 0.5 ) );

		expect( trimToBeneathTriPlane( triangle, line, target ) ).toBe( true );
		expect( target.distance() ).toBe( 1 );
		expect( target.at( 0.5, vec ).y ).toBeLessThan( 0 );
		expect( triangle.getNormal( vec ).y ).toBe( 1 );

	} );

} );
