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
			queuedToRun = setTimeout(invokeFn.bind(null, ...args), wait - (now - previouslyRun));
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

	const varset = el => {
		area.style.setProperty("--" + el.name, el.value);
	};

	const sliders = interactive.querySelectorAll("input[type=range]");
	for (const slider of sliders) {
		varset(slider);
		slider.oninput = e => varset(e.target);
	}
}

// Pause animations when element is not in viewport
const obs = new IntersectionObserver(els => {
	els.forEach(el => {
		el.intersectionRatio > 0 ? el.target.classList.add("in-view") : el.target.classList.remove("in-view");
	});
});
if ("IntersectionObserver" in window) {
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
