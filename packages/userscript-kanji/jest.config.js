module.exports = {
   moduleFileExtensions: ['js', 'json', 'ts'],
   rootDir: 'src',
   testEnvironment: 'node',
   testRegex: /\.spec\.ts$/.source,
   transform: {
      [/^.+\.(t|j)s$/.source]: 'ts-jest',
   },
   globals: {
      'ts-jest': {
         packageJson: 'package.json',
         tsConfig: 'tsconfig.spec.json',
      },
      'fetch': require('node-fetch'),
   },
};
