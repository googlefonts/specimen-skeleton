const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);

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
};
