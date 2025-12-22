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
		exclude: [],
	},

};
