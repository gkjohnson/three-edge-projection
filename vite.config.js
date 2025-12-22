import { searchForWorkspaceRoot } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

export default {

	root: './example/',
	base: './',
	resolve: {
		alias: {
			'three-edge-projection': path.resolve( __dirname, 'src/index.js' ),
		},
	},
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
				// Disable code splitting - bundle everything into single files per entry
				manualChunks: undefined,
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
		// Exclude three.js and three-mesh-bvh from Vite's dependency pre-bundling
		exclude: [ 'three', 'three-mesh-bvh', 'clipper2-js' ],
	},

};
