import { html, render } from 'lit-html';
import { assert } from 'misc-util';

import './script/kanji-main';
import './script/kanji-meanings';
import './script/kanji-readings';
import { parseData } from './script/parse-data';

const kanjiContainer = assert(document.querySelector('#kanji'));
const infoContainer = assert(document.querySelector('#info'));

const data = parseData(`{{Data}}`);

render(html`<kanji-main .kanji=${data.kanji} drawing showGridToggle showDrawingToggle showUndoButton showClearButton></kanji-main>`, kanjiContainer);

render(
	html`
		<kanji-meanings .meanings=${data.meanings} .keyword=${data.keyword}></kanji-meanings>
		<kanji-readings .onyomi=${data.onyomi} .kunyomi=${data.kunyomi}></kanji-readings>
	`,
	infoContainer,
);
