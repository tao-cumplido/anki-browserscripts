/* eslint-disable @typescript-eslint/naming-convention */

import 'dotenv/config';

import path from 'path';
import url from 'url';

import type { loader as Loader, Configuration, Stats } from 'webpack';
import { readFileSync } from 'fs-extra';
import { JSDOM } from 'jsdom';
import { fs as memfs } from 'memfs';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import webpack, { DefinePlugin } from 'webpack';
import WebpackUserscript from 'webpack-userscript';

import { assertReturn } from '@~internal/util';

import { buildAnkiTemplateConfig } from './webpack.anki';
import { babelPluginTemplateMinifier } from './webpack.shared';

const production = process.env['NODE_ENV'] === 'production';
const debugAnkiModels = assertReturn<boolean>(JSON.parse(process.env['DEBUG_ANKI_MODELS'] ?? 'false'));

const {
	env: { KANJI_DB_BASE },
} = process;

if (!KANJI_DB_BASE) {
	throw new Error('missing env variable for remote kanji db');
}

const config: Configuration = {
	mode: production ? 'production' : 'development',
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
							plugins: ['@babel/plugin-proposal-logical-assignment-operators', production ? babelPluginTemplateMinifier : {}],
						},
					},
					{
						loader: 'ts-loader',
						options: {
							configFile: 'tsconfig.app.json',
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
					minimize:
						// prettier-ignore
						production ?
						{
							caseSensitive: true,
							collapseWhitespace: true,
							conservativeCollapse: true,
							keepClosingSlash: true,
							removeComments: true,
							removeRedundantAttributes: true,
						} :
						false,
					preprocessor: async (content: string, loader: Loader.LoaderContext): Promise<string> => {
						// compile referenced sources for each html file

						const {
							window: { document },
						} = new JSDOM(content);

						for (const script of document.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'script')) {
							if (!script.src) {
								continue;
							}

							const sourcePath = path.join(loader.context, script.src);
							const targetPath = `${path.parse(sourcePath).name}.js`;

							const compiler = webpack(buildAnkiTemplateConfig(sourcePath, targetPath, production, debugAnkiModels));

							// use virtual filesystem for the compiled code
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

							// add anki model dependencies to main webpack process to register them for recompiling on save
							for (const dependency of [...compilation.fileDependencies].filter((file) => file.includes(loader.context))) {
								loader.addDependency(dependency);
							}

							// remove src attribute to inline compiled code from virtual file system
							script.removeAttribute('src');

							const code = memfs.readFileSync(targetPath, 'utf-8') as string;

							// replace double braces with their escape sequence to prevent anki complaining
							script.textContent = `\n${code.replace(/`\{\{(lit-.+?)\}\}`/gmu, '`\\x7b\\x7b$1\\x7d\\x7d`')}\n`;
							script.textContent = script.textContent.replace(/"\{\{(.+?)\}\}"/gmu, '`{{$1}}`');

							if (debugAnkiModels) {
								script.textContent = `${script.textContent.replace(/\{\{lit-guid\}\}/gmu, ' ')}//# sourceURL=${targetPath}\n`;
							}
						}

						if (!document.body?.innerHTML) {
							throw new Error('unexpected missing body');
						}

						return document.body.innerHTML;
					},
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	devtool: production ? false : 'eval-source-map',
	optimization: {
		minimizer: [
			new TerserWebpackPlugin({
				sourceMap: true,
				terserOptions: {},
			}),
		],
	},
	plugins: [
		new DefinePlugin({
			PRODUCTION: production,
			KANJI_DB_BASE: JSON.stringify(KANJI_DB_BASE),
		}),
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
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		clientLogLevel: 'error',
		writeToDisk: true, // allows tampermonkey to reload the script
		disableHostCheck: true, // allows auto reload in external https site
		https: {
			key: readFileSync(process.env['LOCALHOST_KEY'] ?? ''),
			cert: readFileSync(process.env['LOCALHOST_CERT'] ?? ''),
			ca: readFileSync(process.env['LOCALHOST_ROOTCA'] ?? ''),
		},
	},
};

export default config;
