import "./assets.js";
import FontFaceObserver from "fontfaceobserver";

const fontName = "Fraunces";
const fontTimeOut = 5000; // In milliseconds

// Generic functions
// From https://gist.github.com/beaucharman/e46b8e4d03ef30480d7f4db5a78498ca#gistcomment-3015837
const throttle = (fn, wait) => {
	let previouslyRun, queuedToRun;

	return function invokeFn(...args) {
		const now = Date.now();

		queuedToRun = clearTimeout(queuedToRun);

		if (!previouslyRun || now - previouslyRun >= wait) {
			fn.apply(null, args);
			previouslyRun = now;
		} else {
			queuedToRun = setTimeout(
				invokeFn.bind(null, ...args),
				wait - (now - previouslyRun)
			);
		}
	};
};

// Set up FontFaceObserver
const font = new FontFaceObserver(fontName);
font.load(null, fontTimeOut).then(
	() => {
		console.log("Font is available");
		document.documentElement.className += " fonts-loaded";
	},
	() => {
		console.log("Font is not available");
	}
);

// Interactive contols (sliders that tweak axes)
const interactives = document.querySelectorAll(".interactive-controls");
for (const interactive of interactives) {
	const area = interactive.querySelector(".interactive-controls-text");
	const sliders = interactive.querySelectorAll(
		".interactive-controls-slider"
	);
	const instances = interactive.querySelector(
		".interactive-controls-instances"
	);

	const varset = (name, value) => {
		area.style.setProperty(`--${name}`, value);
	};

	for (const slider of sliders) {
		// Apply initial axis value to text area
		varset(slider.name, slider.value);
		slider.oninput = e => {
			// Set new axis value to text area
			varset(e.target.name, e.target.value);
			// Unselect named instance dropdown
			// Optionally, see if current axes match instance and select that
			if (instances) {
				instances.selectedIndex = -1;
			}
		};
	}

	if (instances) {
		instances.onchange = e => {
			const axes = JSON.parse(
				e.target.options[e.target.selectedIndex].value
			);
			for (const axis in axes) {
				// Set new axis value on slider
				interactive.querySelector(`[name=${axis}]`).value = axes[axis];
				// Apply new axis value to text area
				varset(axis, axes[axis]);
			}
		};
	}
}

if ("IntersectionObserver" in window) {
	// Pause animations when element is not in viewport
	// eslint-disable-next-line compat/compat
	const obs = new IntersectionObserver(els => {
		els.forEach(el => {
			el.intersectionRatio > 0
				? el.target.classList.add("in-view")
				: el.target.classList.remove("in-view");
		});
	});

	const elements = document.querySelectorAll(".animates");
	elements.forEach(el => {
		obs.observe(el);
	});
}

// Character grid
const grid = document.querySelector(".character-grid");
const gridzoom = document.querySelector(".character-grid-zoom");
grid.onmousemove = throttle(e => {
	if (e.target.tagName === "LI") {
		gridzoom.innerHTML = e.target.innerHTML;
	}
}, 100);
