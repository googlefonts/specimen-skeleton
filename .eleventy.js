const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const htmlmin = require("html-minifier");

const inputDir = path.resolve(__dirname, "./src");

const webpackAsset = async name => {
	const manifestData = await readFile(
		path.resolve(inputDir, "_includes", ".webpack", "manifest.json")
	);
	const manifest = JSON.parse(manifestData);

	const assetPath = manifest[name];
	if (assetPath == null) {
		throw new Error(
			`Unknown Webpack asset requested: ${name}. Check .webpack/manifest.json.`
		);
	}

	return assetPath;
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

	return {
		dir: {
			input: inputDir,
			layouts: "_layouts"
		}
	};
};
