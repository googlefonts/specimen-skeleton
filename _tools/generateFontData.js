const fs = require("fs");
const util = require("util");
const path = require("path");
const {
	parseFontFile,
	buildCssFontFace
} = require("specimen-boilerplate-support/fontData");

const srcDirectory = path.resolve(__dirname, "../", "src");
const fontsDirectory = path.resolve(srcDirectory, "fonts");
const dataDirectory = path.resolve(srcDirectory, "_data");
const fontFaceCssPath = path.resolve(srcDirectory, "css", "_fonts.css");

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

const writeDataFile = async (filename, data) => {
	const dataFilePath = path.join(dataDirectory, filename);
	const fileContents = JSON.stringify(data, null, 4);

	return writeFile(dataFilePath, fileContents);
};

const writeDataFiles = async fontData => {
	const promises = Object.entries(fontData).map(([type, data]) => {
		return writeDataFile(`${type}.json`, data);
	});

	return Promise.all(promises);
};

const writeCssFontFace = async (fontData, fontFilePath) => {
	const fontUrl = path.relative(path.dirname(fontFaceCssPath), fontFilePath);
	const fontFace = buildCssFontFace(fontData, fontUrl);
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
		const fontFilePath =
			process.argv[2] || (await findFirstFontFile(fontsDirectory));
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

main();
