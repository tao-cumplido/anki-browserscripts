import { html, render } from 'lit-html';
import { assert } from 'misc-util';

import type { KanjiMain, Point } from './script/kanji-main';
import './script/kanji-frequencies';
import { parseData } from './script/parse-data';

const container = assert(document.querySelector('#solution'));
const main = assert(document.querySelector<KanjiMain>('kanji-main'));

const data = parseData(`{{Data}}`);

if (Persistence.isAvailable()) {
	const image = Persistence.getItem<Point[][]>(main.kanji) ?? [];

	const drawImage = () => {
		if (!main.setDrawingColor || !main.drawImage) {
			window.requestAnimationFrame(() => drawImage());
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
	const kanji = assert(container.parentElement?.insertBefore(document.createElement('div'), container));
	kanji.textContent = main.kanji;
}

if (data.frequency) {
	render(html`<kanji-frequencies .ranks=${data.frequency}></kanji-frequencies>`, container);
}
