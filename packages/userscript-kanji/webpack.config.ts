/* eslint-disable @typescript-eslint/naming-convention */

import path from 'path';
import url from 'url';

import type { loader, Configuration, Stats } from 'webpack';
import 'dotenv/config';
import { readFileSync } from 'fs-extra';
import { JSDOM } from 'jsdom';
import { fs as memfs } from 'memfs';
import { assert } from 'misc-util';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import webpack, { DefinePlugin } from 'webpack';
import WebpackUserscript from 'webpack-userscript';

const production = process.env['NODE_ENV'] === 'production';
const mode = production ? 'production' : 'development';
const debugAnkiModels = assert<boolean>(JSON.parse(process.env['DEBUG_ANKI_MODELS'] ?? 'false'));
const devtool = production ? false : 'eval-source-map';
const tsConfig = 'tsconfig.app.json';

const {
	env: { PARSE_SERVER_URL, PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY },
} = process;

if ([PARSE_SERVER_URL, PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY].includes(undefined)) {
	throw new Error('missing env variables for Parse server config');
}

const defineScript = new DefinePlugin({
	PRODUCTION: production,
	PARSE_SERVER_URL: JSON.stringify(PARSE_SERVER_URL),
	PARSE_APPLICATION_ID: JSON.stringify(PARSE_APPLICATION_ID),
	PARSE_JAVASCRIPT_KEY: JSON.stringify(PARSE_JAVASCRIPT_KEY),
});

const defineModel = new DefinePlugin({
	PRODUCTION: production,
});

const config: Configuration = {
	mode,
	entry: './src/index.ts',
	module: {
		rules: [
			{
				test: /\.ts$/u,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [['@babel/preset-env', { modules: false }]],
							plugins: ['@babel/plugin-proposal-unicode-property-regex'],
						},
					},
					{
						loader: 'ts-loader',
						options: {
							configFile: tsConfig,
						},
					},
				],
				exclude: /node_modules/u,
			},
			{
				test: /\.scss$/u,
				use: ['to-string-loader', 'css-loader', 'sass-loader'],
			},
			{
				test: /\.html$/u,
				loader: 'html-loader',
				options: {
					minimize: false,
					preprocessor: async (content: string, context: loader.LoaderContext): Promise<string> => {
						const {
							window: { document },
						} = new JSDOM(content);

						for (const script of document.querySelectorAll('script')) {
							if (!script.src) {
								continue;
							}

							const sourcePath = path.join(context.context, script.src);
							const targetPath = `${path.parse(sourcePath).name}.js`;

							const compiler = webpack({
								mode: 'production',
								entry: sourcePath,
								output: {
									path: __dirname,
									filename: targetPath,
								},
								module: {
									rules: [
										{
											test: /\.ts$/u,
											use: [
												{
													loader: 'babel-loader',
													options: {
														presets: [['@babel/preset-env', { targets: 'Chrome >= 77', modules: false }]],
														plugins: [
															'@babel/plugin-proposal-unicode-property-regex',
															[
																'template-html-minifier',
																{
																	modules: {
																		'lit-html': ['html', 'svg'],
																		'lit-element': ['html', 'svg', { name: 'css', encapsulation: 'style' }],
																	},
																	strictCSS: true,
																	htmlMinifier: {
																		collapseWhitespace: true,
																		conservativeCollapse: true,
																		removeComments: true,
																		caseSensitive: true,
																		minifyCSS: true,
																	},
																},
															],
														],
													},
												},
												{
													loader: 'ts-loader',
													options: {
														configFile: tsConfig,
													},
												},
											],
											exclude: /node_modules/u,
										},
										{
											test: /\.svg$/u,
											use: [
												{
													loader: 'string-replace-loader',
													options: {
														search: /<\?xml.+d=\\"(.+?)\\".+svg>/u,
														replace: '$1',
													},
												},
												{
													loader: 'raw-loader',
												},
											],
										},
										{
											test: /\.scss$/u,
											use: ['to-string-loader', 'css-loader', 'sass-loader'],
										},
									],
								},
								resolve: {
									extensions: ['.ts', '.js', '.scss'],
								},
								devtool: debugAnkiModels ? 'source-map' : false,
								plugins: [
									defineModel,
									new TerserWebpackPlugin({
										cache: true,
										parallel: true,
										sourceMap: debugAnkiModels,
										terserOptions: {
											output: {
												comments: false,
											},
										},
									}),
								],
							});

							compiler.outputFileSystem = {
								join: path.join.bind(path),
								mkdir: memfs.mkdir.bind(memfs),
								mkdirp: memfs.mkdirp.bind(memfs),
								rmdir: memfs.rmdir.bind(memfs),
								unlink: memfs.unlink.bind(memfs),
								writeFile: memfs.writeFile.bind(memfs),
							};

							const { compilation } = await new Promise<Stats>((resolve, reject) => {
								compiler.run((error: Error | null, stats) => (error ? reject(error) : resolve(stats)));
							});

							for (const dependency of [...compilation.fileDependencies].filter((file) => file.includes(context.context))) {
								context.addDependency(dependency);
							}

							script.removeAttribute('src');

							const code = memfs.readFileSync(targetPath, 'utf-8') as string;

							// replace double braces with their escape sequence to prevent anki complaining
							script.textContent = `\n${code.replace(/`\{\{(lit-.+?)\}\}`/gmu, '`\\x7b\\x7b$1\\x7d\\x7d`')}\n`;
							script.textContent = script.textContent.replace(/"\{\{(.+?)\}\}"/gmu, '`{{$1}}`');

							if (debugAnkiModels) {
								script.textContent = `${script.textContent.replace(/\{\{lit-guid\}\}/gmu, ' ')}//# sourceURL=${targetPath}\n`;
							}
						}

						return document.body.innerHTML;
					},
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js', '.scss'],
	},
	devtool,
	performance: {
		hints: false,
	},
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		clientLogLevel: 'error',
		writeToDisk: true,
		disableHostCheck: true,
		https: {
			key: readFileSync(process.env['LOCALHOST_KEY'] ?? ''),
			cert: readFileSync(process.env['LOCALHOST_CERT'] ?? ''),
			ca: readFileSync(process.env['LOCALHOST_ROOTCA'] ?? ''),
		},
	},
	plugins: [
		defineScript,
		new WebpackUserscript({
			headers: {
				name: 'kanji2anki',
				version: production ? '[version]' : '[version]-build.[buildNo]',
				description: 'Add kanji from online dictionaries to anki',
				updateURL: (production && process.env['SCRIPT_UPDATE_URL']) || '',
				author: '[author]',
				match: ['https://jisho.org/search/*'],
				grant: ['GM_addStyle'],
			},
			proxyScript: {
				baseUrl: url.pathToFileURL(path.join(__dirname, 'dist')).href,
				filename: '[basename].proxy.user.js',
				enable: !production,
			},
		}),
	],
};

export default config;
