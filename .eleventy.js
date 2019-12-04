const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const htmlmin = require("html-minifier");

const webpackAsset = async name => {
	const manifestData = await readFile(
		path.resolve(__dirname, "_includes", ".webpack", "manifest.json")
	);
	const manifest = JSON.parse(manifestData);
	return manifest[name];
};

const webpackAssetContents = async name => {
	const assetName = await webpackAsset(name);
	const filePath = path.resolve(__dirname, "_site", assetName);

	return readFile(filePath);
};

module.exports = eleventyConfig => {
	eleventyConfig.setUseGitIgnore(false);

	eleventyConfig.addLiquidShortcode("webpackAsset", webpackAsset);
	eleventyConfig.addLiquidShortcode(
		"webpackAssetContents",
		webpackAssetContents
	);

	eleventyConfig.addFilter("json_stringify", JSON.stringify);

	if (process.env.ELEVENTY_ENV === "production") {
		eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
			if (outputPath.endsWith(".html")) {
				let minified = htmlmin.minify(content, {
					useShortDoctype: true,
					removeComments: true,
					collapseWhitespace: true
				});
				return minified;
			}

			return content;
		});
	}
};
