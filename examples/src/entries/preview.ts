import RunTests from 'src/preview';

const CONTENT_ELEMENT_CLASS = 'j-content';

document.addEventListener("DOMContentLoaded", () => {
	let element = document.getElementsByClassName(CONTENT_ELEMENT_CLASS)[0];
	if (!!element && element instanceof HTMLElement) {
		RunTests(element);
	} else {
		throw new Error(`The element with class "${CONTENT_ELEMENT_CLASS}" is not found.`);
	}
});