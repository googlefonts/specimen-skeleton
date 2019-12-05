const fs = require("fs");
const util = require("util");
const path = require("path");
const fontKit = require("fontkit");

const writeFile = util.promisify(fs.writeFile);
const loadFont = util.promisify(fontKit.open);

const dataDirectory = path.resolve(__dirname, "../", "src", "_data");

const writeDataFile = async (filename, data) => {
	const dataFilePath = path.join(dataDirectory, filename);
	const fileContents = JSON.stringify(data, null, 4);

	return writeFile(dataFilePath, fileContents);
};

const writeAxes = font => {
	return Object.entries(font.variationAxes).map(([axis, data]) => ({
		axis: axis,
		name: data.name,
		min: data.min,
		max: data.max,
		default: data.default
	}));
};

const writeChars = font => {
	return font.characterSet.map(code => `&#${code};`);
};

const writeInstances = font => {
	return Object.entries(font.namedVariations).map(([name, axes]) => ({
		name,
		axes
	}));
};

const parseFontFile = async path => {
	const font = await loadFont(path);
	return {
		axes: writeAxes(font),
		charset: writeChars(font),
		instances: writeInstances(font)
	};
};

const writeDataFiles = fontData => {
	const promises = Object.entries(fontData).map(([type, data]) => {
		return writeDataFile(`${type}.json`, data);
	});

	return Promise.all(promises);
};

const main = async () => {
	try {
		const data = await parseFontFile(process.argv[2]);
		await writeDataFiles(data);
	} catch (e) {
		console.error("Failed to generate font data.", e);
		process.exit(1);
	}
};

module.exports.parseFontFile = parseFontFile;

if (require.main === module) {
	main();
}
