module.exports = {
	extends: ["stylelint-config-standard", "stylelint-config-prettier"],
	plugins: ["stylelint-no-unsupported-browser-features"],
	rules: {
		"selector-class-pattern": "^([a-z][a-z0-9]*)(-[a-z0-9]+)*$",
		indentation: "tab",
		"selector-pseudo-class-no-unknown": [
			true,
			{
				ignorePseudoClasses: ["global"]
			}
		],
		"plugin/no-unsupported-browser-features": [
			true,
			{
				severity: "warning",
				ignore: ["font-unicode-range", "css-resize", "css-appearance"]
			}
		]
	}
};
