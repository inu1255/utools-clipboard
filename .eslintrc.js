module.exports = {
	parser: "@typescript-eslint/parser",
	extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended", "prettier"],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: "module",
	},
	rules: {
		"no-use-before-define": ["error", {functions: false, classes: false}],
		"@typescript-eslint/no-var-requires": 0,
		"@typescript-eslint/no-empty-function": 0,
		"@typescript-eslint/no-non-null-assertion": 0,
		"@typescript-eslint/ban-ts-comment": 0,
	},
};
