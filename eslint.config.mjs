import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),

	{
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			'simple-import-sort/imports': [
				'warn',
				{
					groups: [
						['^node:'],
						['^react', '^next', '^[a-z]'], // external packages
						['^@/'], // alias imports
						['^\\.\\.(?!/?$)', '^\\./'], // relative imports
						['^.+\\.s?css$'], // style imports
					],
				},
			],
			'simple-import-sort/exports': 'warn',
		},
	},
];

export default eslintConfig;
