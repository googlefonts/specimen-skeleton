const fs = require("fs");
const util = require("util");
const path = require("path");
const fontKit = require("fontkit");

const writeFile = util.promisify(fs.writeFile);
const loadFont = util.promisify(fontKit.open);

const dataDirectory = path.resolve(__dirname, "../", "src", "_data");
const fontFaceCssPath = path.resolve(
	__dirname,
	"../",
	"src",
	"css",
	"_font-faces.css"
);

const writeDataFile = async (filename, data) => {
	const dataFilePath = path.join(dataDirectory, filename);
	const fileContents = JSON.stringify(data, null, 4);

	return writeFile(dataFilePath, fileContents);
};

const buildAxes = font => {
	return Object.entries(font.variationAxes).map(([axis, data]) => ({
		axis: axis,
		name: data.name,
		min: data.min,
		max: data.max,
		default: data.default
	}));
};

const buildChars = font => {
	return font.characterSet.map(code => `&#${code};`);
};

const buildInstances = font => {
	return Object.entries(font.namedVariations).map(([name, axes]) => ({
		name,
		axes
	}));
};

const parseFontFile = async path => {
	const font = await loadFont(path);
	return {
		name: font.postscriptName,
		data: {
			axes: buildAxes(font),
			charset: buildChars(font),
			instances: buildInstances(font)
		}
	};
};

const writeDataFiles = async fontData => {
	const promises = Object.entries(fontData).map(([type, data]) => {
		return writeDataFile(`${type}.json`, data);
	});

	return Promise.all(promises);
};

const writeCssFontFace = async (fontData, fontFilePath) => {
	const fontWeight = fontData.data.axes.find(({ axis }) => axis == "wght");

	const fontUrl = path.relative(path.dirname(fontFaceCssPath), fontFilePath);
	const min = Math.max(fontWeight.min, 1);
	const max = fontWeight.max;

	const fontFace = `@font-face {
  font-family: ${fontData.name};
  font-weight: ${min} ${max};
  src: url("${fontUrl}");
}`;

	return writeFile(fontFaceCssPath, fontFace);
};

const main = async () => {
	try {
		const fontFilePath = process.argv[2];
		const fontData = await parseFontFile(fontFilePath);

		await Promise.all([
			writeDataFiles(fontData.data),
			writeCssFontFace(fontData, fontFilePath)
		]);
	} catch (e) {
		console.error("Failed to generate font data.", e);
		process.exit(1);
	}
};

module.exports.parseFontFile = parseFontFile;

if (require.main === module) {
	main();
}
