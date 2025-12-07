export function getAllMeshes( scene ) {

	let meshes = [];
	scene.traverse( c => {

		if ( c.geometry && c.visible ) {

			meshes.push( c );

		}

	} );

	return meshes;

}
