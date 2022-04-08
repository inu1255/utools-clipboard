const TS_RULES = {
	"no-dupe-class-members": 0,
	"@typescript-eslint/no-unused-vars": 1,
};
const RULES = {
	"no-var": 0,
	camelcase: 0,
	eqeqeq: 0,
	"no-console": 0,
	"object-shorthand": 0,
	"rules/prefer-includes": 0,
	"no-empty": 0,
	"no-redeclare": 0,
	"prefer-spread": 0,
	"prefer-const": 0,
	"no-prototype-builtins": 0,
	"no-new-func": 0,
	"no-control-regex": 0,
	"no-useless-escape": 0,
	"prefer-promise-reject-errors": 0,
	"require-await": 0,
	"no-throw-literal": 0,
	"no-template-curly-in-string": 0,
	"no-unused-vars": ["warn", {vars: "all", args: "none", ignoreRestSiblings: true}],
	"no-use-before-define": ["error", {functions: false, classes: false}],
	"no-else-return": ["error", {allowElseIf: false}],
	"import/order": 0,
	// unicorn
	"unicorn/prefer-includes": 0,
	"unicorn/throw-new-error": 0,
	// vue
	"vue/require-default-prop": 0,
	"vue/no-mutating-props": 0,
	"vue/require-prop-types": 0,
	// nuxt
	"nuxt/no-cjs-in-config": 0,
	"node/no-callback-literal": 0,
};
module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	parserOptions: {
		parser: "@babel/eslint-parser",
		requireConfigFile: false,
	},
	extends: ["@nuxtjs", "plugin:nuxt/recommended", "plugin:prettier/recommended"],
	plugins: [],
	globals: {
		dataLayer: "readonly",
		electron_api: "readonly",
		gevt: "readonly",
		gtag: "readonly",
		ClipboardItem: "readonly",
		utools: "readonly",
	},
	// add your custom rules here
	rules: RULES,
	overrides: [
		{
			files: ["*.ts"],
			parserOptions: {},
			extends: [
				"@nuxtjs/eslint-config-typescript",
				"plugin:nuxt/recommended",
				"plugin:prettier/recommended",
			],
			rules: Object.assign(TS_RULES, RULES),
		},
	],
};
