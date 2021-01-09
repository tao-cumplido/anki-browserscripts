export const babelPluginTemplateMinifier = [
	'template-html-minifier',
	{
		modules: {
			'lit-html': ['html', 'svg'],
			'lit-element': ['html', 'svg', { name: 'css', encapsulation: 'style' }],
		},
		// eslint-disable-next-line @typescript-eslint/naming-convention
		strictCSS: true,
		htmlMinifier: {
			collapseWhitespace: true,
			conservativeCollapse: true,
			removeComments: true,
			caseSensitive: true,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			minifyCSS: true,
		},
	},
];
