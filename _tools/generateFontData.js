// Copyright 2019 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// 	https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require("fs");
const util = require("util");
const path = require("path");
const {
	parseFontFile,
	buildStylesheet,
	buildFontJs
} = require("specimen-skeleton-support");

const srcDirectory = path.resolve(__dirname, "../", "src");
const fontsDirectory = path.resolve(srcDirectory, "fonts");
const dataDirectory = path.resolve(srcDirectory, "_data");
const fontsStylesheetDirectory = path.resolve(srcDirectory, "css");
const fontJsDirectory = path.resolve(srcDirectory, "js");

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

const writeDataFiles = async (fontData, fontName) => {
	const promises = Object.entries(fontData).map(([type, data]) => {
		return writeDataFile(`${fontName}-${type}.json`, data);
	});

	return Promise.all(promises);
};

const writeStylesheet = async (fontData, fontFile) => {
	const fontUrl = path.relative(
		path.dirname(fontsStylesheetDirectory),
		fontFile.path
	);
	const stylesheet = buildStylesheet(fontData, fontUrl).toString();
	const stylesheetPath = path.resolve(
		fontsStylesheetDirectory,
		`${fontFile.name}.css`
	);
	return writeFile(stylesheetPath, stylesheet);
};

const writeFontJs = async (fontData, fontName) => {
	const js = buildFontJs(fontData);
	const jsPath = path.resolve(fontJsDirectory, `${fontName}.js`);
	return writeFile(jsPath, js);
};

const findFontFile = async directory => {
	const fontFiles = (await util.promisify(fs.readdir)(directory)).filter(
		f => path.extname(f) == ".woff2"
	);

	assert(
		fontFiles.length > 0,
		`No WOFF2 font files found. Place your WOFF2 fonts in ${path.relative(
			process.cwd(),
			directory
		)}.`
	);

	const paths = fontFiles.map(fontFile => ({
		name: path.basename(fontFile, path.extname(fontFile)),
		path: path.resolve(fontsDirectory, fontFile)
	}));

	return paths;
};

const main = async () => {
	const fontFiles = process.argv[2] || (await findFontFile(fontsDirectory));

	for (const fontFile of fontFiles) {
		const fontData = await parseFontFile(fontFile.path);
		await Promise.all([
			writeDataFiles(fontData.data, fontFile.name),
			writeStylesheet(fontData, fontFile),
			writeFontJs(fontData, fontFile.name)
		]);
	}
};

main().catch(e => {
	process.exitCode = 1;
	console.error("Failed to generate font data.", e);
});
