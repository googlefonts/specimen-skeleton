const fs = require("fs");
const util = require("util");
const path = require("path");
const fontKit = require("fontkit");

const assert = (condition, message) => {
	if (!condition) {
		throw new Error(message);
	}
};

const _writeFile = util.promisify(fs.writeFile);
const writeFile = (path, contents) => {
	console.info("Writing", path);
	return _writeFile(path, contents);
};

const loadFont = util.promisify(fontKit.open);

const srcDirectory = path.resolve(__dirname, "../", "src");
const fontsDirectory = path.resolve(srcDirectory, "fonts");
const dataDirectory = path.resolve(srcDirectory, "_data");
const fontFaceCssPath = path.resolve(srcDirectory, "css", "_font-faces.css");

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

/**
 * Generates a css declaration based on a font axis.
 * @param {object} fontData
 * @param {string} property - css property to generate
 * @param {string} axisName - name of the font axis
 *
 * @example axisRangeDeclaration(fontData, "font-weight", "wght");
 * // returns "font-weight: 1 500;" (depending on actual range of font)
 */
const axisRangeDeclaration = (fontData, property, axisName) => {
	const axis = fontData.data.axes.find(({ axis }) => axis == axisName);

	const declaration = axis => {
		const min = Math.max(axis.min, 1); // 0 is not valid in css in this context
		const max = axis.max;

		return `${property}: ${min} ${max};`;
	};

	return axis ? declaration(axis) : null;
};

/**
 * Generates a CSS @font-face declaration for the provided font file.
 *
 * Includes:
 * - font-familiy
 * - font-weight (if font has a wght axis)
 * - font-stretch (if font has wdth axis)
 * - src
 * @param {object} fontData
 * @param {string} fontFilePath
 */
const buildCssFontFace = (fontData, fontFilePath) => {
	const fontUrl = path.relative(path.dirname(fontFaceCssPath), fontFilePath);

	const declarations =
		[
			`font-family: ${fontData.name};`,
			axisRangeDeclaration(fontData, "font-weight", "wght"),
			axisRangeDeclaration(fontData, "font-stretch", "wdth"),
			`src: url("${fontUrl}");`
		]
			.filter(d => d != null)
			.map(d => `  ${d}`)
			.join("\n") + "\n";

	return `@font-face {\n${declarations}}`;
};

const writeCssFontFace = async (fontData, fontFilePath) => {
	const fontFace = buildCssFontFace(fontData, fontFilePath);
	return writeFile(fontFaceCssPath, fontFace);
};

const findFirstFontFile = async directory => {
	const fontFiles = await util.promisify(fs.readdir)(directory);

	assert(
		fontFiles.length > 0,
		`No font file found. Place your font in ${path.relative(
			process.cwd(),
			directory
		)}.`
	);

	assert(
		fontFiles.length == 1,
		"Multiple font files found. Please specify the path to your font file explicitly."
	);

	return path.resolve(fontsDirectory, fontFiles[0]);
};

const main = async () => {
	try {
		const firstArg = process.argv[2];

		const fontFilePath = await (firstArg ||
			(await findFirstFontFile(fontsDirectory)));
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
module.exports.buildCssFontFace = buildCssFontFace;

if (require.main === module) {
	main();
}
