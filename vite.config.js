import { searchForWorkspaceRoot } from 'vite';
import fs from 'fs';

export default {

	root: './example/',
	base: '',
	build: {
		sourcemap: true,
		outDir: './dist/',
		minify: false,
		terserOptions: {
			compress: false,
			mangle: false,
		},
		rollupOptions: {
			input: fs
				.readdirSync( './example/' )
				.filter( p => /\.html$/.test( p ) )
				.map( p => `./example/${ p }` ),
			output: {
				manualChunks: ( id ) => {

					// Force three.js and three-mesh-bvh into a single vendor chunk
					// to prevent module instance duplication on GitHub Pages
					if ( id.includes( 'node_modules/three' ) ) {

						return 'vendor-three';

					}

					if ( id.includes( 'node_modules/three-mesh-bvh' ) ) {

						return 'vendor-three';

					}

					if ( id.includes( 'node_modules/clipper2-js' ) ) {

						return 'vendor-clipper';

					}

				},
			},
		},
	},
	server: {
		fs: {
			allow: [
				// search up for workspace root
				searchForWorkspaceRoot( process.cwd() ),
			],
		},
	},
	optimizeDeps: {
		exclude: [],
	},

};
