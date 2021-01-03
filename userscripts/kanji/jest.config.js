module.exports = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: 'src',
	testEnvironment: 'node',
	testRegex: /\.spec\.ts$/u.source,
	transform: {
		[/^.+\.(t|j)s$/u.source]: 'ts-jest',
	},
	globals: {
		'ts-jest': {
			packageJson: 'package.json',
			tsConfig: 'tsconfig.spec.json',
		},
		'fetch': require('node-fetch'),
	},
};
