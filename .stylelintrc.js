const cssNamePattern = /^[a-z]+(-([a-z]+|\d+))*$/u;

module.exports = {
	plugins: ['stylelint-scss'],
	extends: ['stylelint-config-recommended', 'stylelint-prettier/recommended'],
	ignoreFiles: ['**/node_modules/**/*'],
	rules: {
		'prettier/prettier': null,
		// core
		'function-calc-no-invalid': true,
		'selector-type-no-unknown': [true, { ignore: ['custom-elements'] }],
		'no-empty-source': null,
		'shorthand-property-no-redundant-values': true,
		'declaration-block-no-redundant-longhand-properties': true,
		'declaration-no-important': true,
		'color-hex-length': 'short',
		// scss
		'scss/at-each-key-value-single-line': true,
		'scss/at-extend-no-missing-placeholder': true,
		'scss/at-if-no-null': true,
		'scss/at-import-no-partial-leading-underscore': true,
		'scss/at-import-partial-extension': 'never',
		'at-rule-no-unknown': null,
		'scss/at-rule-no-unknown': true,
		'scss/dollar-variable-no-missing-interpolation': true,
		'scss/declaration-nested-properties': 'never',
		'scss/dimension-no-non-numeric-values': true,
		'scss/function-color-relative': true,
		'scss/function-quote-no-quoted-strings-inside': true,
		'scss/function-unquote-no-unquoted-strings-inside': true,
		'scss/selector-no-redundant-nesting-selector': true,
		'scss/no-duplicate-dollar-variables': true,
		'scss/no-duplicate-mixins': true,
		// name patterns
		'keyframes-name-pattern': cssNamePattern,
		'custom-property-pattern': cssNamePattern,
		'selector-class-pattern': [cssNamePattern, { resolveNestedSelectors: true }],
		'selector-id-pattern': cssNamePattern,
		'custom-media-pattern': cssNamePattern,
		'scss/at-function-pattern': cssNamePattern,
		'scss/at-mixin-pattern': cssNamePattern,
		'scss/dollar-variable-pattern': cssNamePattern,
		'scss/percent-placeholder-pattern': cssNamePattern,
		// limit language features
		'alpha-value-notation': 'percentage',
		'color-function-notation': 'modern',
		'hue-degree-notation': 'angle',
	},
};
