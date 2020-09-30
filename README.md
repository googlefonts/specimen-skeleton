<p align="center">
	<img width="320" height="320" src="https://user-images.githubusercontent.com/4570664/74532263-0db14500-4f2f-11ea-96e9-49bcb8699ebb.png">
</p>
<h1 align="center">Specimen Skeleton</h1>

## Project setup & development

This project requires Node.js >= 12 and [yarn](https://yarnpkg.com/).

To get started, run the following commands from the root of the repo:

- `yarn install`
- `yarn fontdata` - this will generate data files for the fonts in `src/fonts`
- `yarn start` - this will start the local development server, view at http://localhost:8080.

The site will [automatically](./.github/workflows/ci.yml) be re-built and deployed on Github Pages every time the master branch is updated.

Specimen Skeleton uses external tooling from [Specimen Skeleton Support](https://github.com/kabisa/specimen-skeleton-support/), so we can add or update features without you having to update your specimen!

## What this is

Specimen Skeleton is an [Eleventy-based](https://www.11ty.dev/) specimen _boilerplate_. It helps you get a basic site up and running quickly, and offers you a few interactive elements to build your demos from.

It will analyse your variable font and generate the CSS necessary _and_ all the sliders, so you'll hit the ground running!

## What this isn't

A full-blown specimen generator like [Specimen Tools](https://github.com/graphicore/specimenTools). We did some groundwork, but it's up to you to build the site!

## Checklist / getting started

- Put your WOFF2 fonts in `src/fonts` and run `yarn fontdata`.
- Configure the site in `src/_data/site.js`.
- In JavaScript, respond to fail/success of loading the font in the `FontFaceObserver` code.
- In HTML/CSS, use the `.variable-support` element to communicate when variable fonts aren't supported.
- Start/stop heavy animations by using the `.am-i-in-view` and `.in-view` classes.

## On using fonts

You have two variables at your disposal, which will be generated when you run `yarn fontdata`. See the templates for some example on how to use them.

### fontdata

The `fontdata` variable containsall metadata from `_data/fontdata.json`. This file contains a list of all the fonts found in `src/fonts`, and offers the following variables per font:

`name`, containing the font name (e.g. Bungee Regular)
`selector`, the CSS selector to apply the font (e.g. bungee-regular)
`style`, the suggested style of this font (e.g. regular)

You can change the order of these fonts, so the font family tree makes sense when you loop over them in the specimen (e.g. light weights first, bold weights last). You can also rename the suggested style, which Specimen Skeleton tries to derive from the tfilename. You shouldn't change the selector though — this is used to apply the font in CSS, and to pick fonts from the `fonts` variable.

You can specify which font is the "main" font (usually the "regular" style), by assigning its ID to the `main_id` variable. Note that counting starts at 0!

### fonts

The Specimen Skeleton loops over all fonts, and presents an object for each font with all data from the relevant `src/_data` files. This `font` variable contains its charset, variable axes and variable instances. You can address these by their `selector` from the `fontdata` variable:

`{{ fonts["bungee-regular"].charset }}`

## On using assets

In HTML, to use an image from your `img` directory, use the following URL value with the relative path to your image:

`<img src="{% webpackAssetPath '../img/my_logo.svg' %}">`

If you want to inline an SVG image, use:

`{% include '../img/my_logo.svg' %}`

or

`{% webpackAssetContents 'img/my_logo.svg' %}`

In CSS, point to the file using the path relative to your CSS file:

`background-image: url(../img/my_logo.svg);`

In CSS, images below 8 KB will be inlined automatically. To force inlined or external, append `?inline` or `?external` respectively, e.g. `url(../img/my_logo.svg?external);`. Inlining in HTML files

## Components

The boilerplate has some very basic components you can base your specimen site on:

### Interactive Controls

Basic setup to have interactive axis sliders, as well as a dropdown with named instances. All elements with the class `.interactive-controls-text` inside the parent container `.interactive-controls` will respond to changes.

### Character Grid

Simple grid to show all characters in the font. On hover, the character will be shown in a separate `div`.

### Am I in view?

Simple example to stop CPU-melting animations when they're not in the viewport. Elements with the class `.am-i-in-view` will get a class `.in-view` when they're in the viewport, and have that class removed when they leave the viewport. Use this to start/stop heavy animations.

Note: this can be repurposed for lazy loading images, pausing video, etc.
