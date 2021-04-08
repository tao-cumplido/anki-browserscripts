import { html, render } from 'lit-html';

import { assertReturn } from '@~internal/util';

import type { Point } from './components/kanji-main';
import './components/kanji-frequencies';
import { parseData } from './parse-data';

const container = assertReturn(document.querySelector('#solution'));
const main = assertReturn(document.querySelector('kanji-main'));

const data = parseData(`{{Data}}`);

if (Persistence.isAvailable()) {
	const image = Persistence.getItem<Point[][]>(main.kanji) ?? [];

	const drawImage = () => {
		if (!main.setDrawingColor || !main.drawImage) {
			requestAnimationFrame(() => drawImage());
			return;
		}

		main.setDrawingColor('rgb(0 255 0)', '0.5');
		main.drawImage(image);
	};

	drawImage();
}

if (data.strokes) {
	main.strokes = data.strokes;
	main.showStrokesToggle = true;
	main.showGuidesToggle = true;
	main.showPlayAnimationButton = true;
	main.playAnimation();
} else {
	const kanji = assertReturn(container.parentElement?.insertBefore(document.createElement('div'), container));
	kanji.textContent = main.kanji;
}

if (data.frequency) {
	render(html`<kanji-frequencies .ranks=${data.frequency}></kanji-frequencies>`, container);
}
