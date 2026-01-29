export function getAllMeshes( scene ) {

	let arr;
	if ( Array.isArray( scene ) ) {

		arr = scene;

	} else {

		arr = [ scene ];

	}

	const result = new Set();
	for ( let i = 0, l = arr.length; i < l; i ++ ) {

		arr[ i ].traverse( c => {

			if ( c.geometry && c.visible ) {

				result.add( c );

			}

		} );

	}

	return Array.from( result );

}
