import js from '@eslint/js';
import globals from 'globals';
import mdcs from 'eslint-config-mdcs';
import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';

export default [
	// files to ignore
	{
		name: 'files to ignore',
		ignores: [
			'**/node_modules/**',
			'**/build/**',
			'**/dist/**',
		],
	},

	// recommended
	js.configs.recommended,
	...tseslint.configs.recommended.map( config => ( {
		...config,
		files: [ '**/*.ts' ],
	} ) ),

	// base rules
	{
		name: 'base rules',
		files: [ '**/*.js' ],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			...mdcs.rules,
			'no-unused-vars': [ 'warn', {
				vars: 'all',
				args: 'none',
			} ],
		},
	},

	// ts rule overrides
	{
		name: 'ts rule overrides',
		files: [ '**/*.ts' ],
		rules: {
			'no-undef': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [ 'error', { args: 'none' } ],
			indent: [ 'error', 2 ],
		},
	},

	// vitest
	{
		name: 'vitest rules',
		files: [ '**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts' ],
		plugins: {
			vitest,
		},
		languageOptions: {
			globals: {
				...vitest.environments.env.globals,
			},
		},
		rules: {
			...vitest.configs.recommended.rules,
		},
	},
];
