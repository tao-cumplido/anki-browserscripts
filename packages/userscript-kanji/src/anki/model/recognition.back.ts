import { html, nothing, render } from 'lit-html';
import { assert } from 'misc-util';

import type { KanjiMain } from './script/kanji-main';
import './script/kanji-frequencies';
import './script/kanji-meanings';
import './script/kanji-readings';
import { parseData } from './script/parse-data';

const container = assert(document.querySelector('#solution'));
const main = assert(document.querySelector<KanjiMain>('kanji-main'));

const data = parseData(`{{Data}}`);

render(
	html`
		<kanji-meanings .meanings=${data.meanings} .keyword=${data.keyword}></kanji-meanings>
		<kanji-readings .onyomi=${data.onyomi} .kunyomi=${data.kunyomi}></kanji-readings>
		${data.frequency ? html`<kanji-frequencies .ranks=${data.frequency}></kanji-frequencies>` : nothing}
	`,
	container,
);

main.showGuidesToggle = true;
main.showPlayAnimationButton = true;
main.playAnimation();
