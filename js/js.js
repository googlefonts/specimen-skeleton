const fontName = "Fraunces";
const fontTimeOut = 5000; // In milliseconds

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
