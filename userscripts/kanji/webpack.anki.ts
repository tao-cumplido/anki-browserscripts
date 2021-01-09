import type { Configuration } from 'webpack';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import { DefinePlugin } from 'webpack';

import { babelPluginTemplateMinifier } from './webpack.shared';

export function buildAnkiTemplateConfig(
	sourcePath: string,
	targetPath: string,
	production: boolean,
	debug: boolean,
): Configuration {
	return {
		// always use production mode: without tree-shaking/minification the templates would take over a
		// minute to send to anki each time the page is reloaded during development
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
								// anki 2.1.35+ are built with qt 5.14 which uses chromium 77 for its webview
								presets: [['@babel/preset-env', { targets: 'Chrome >= 77', modules: false }]],
								plugins: [babelPluginTemplateMinifier],
							},
						},
						{
							loader: 'ts-loader',
							options: {
								configFile: 'tsconfig.anki.json',
							},
						},
					],
					exclude: /node_modules/u,
				},
				{
					test: /\.svg$/u,
					use: [
						{
							// extract path data attribute from svg icons
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
			extensions: ['.ts', '.js'],
		},
		// source maps will increase the bundle size considerably and should only be enabled when necessary
		devtool: debug ? 'source-map' : false,
		optimization: {
			minimizer: [
				new TerserWebpackPlugin({
					sourceMap: debug,
					extractComments: false,
					terserOptions: {
						output: {
							comments: false,
						},
					},
				}),
			],
		},
		plugins: [
			new DefinePlugin({
				// eslint-disable-next-line @typescript-eslint/naming-convention
				PRODUCTION: production,
			}),
		],
	};
}
