import { html, render } from 'lit-html';

import { assertReturn } from '@~internal/util';

import './components/kanji-main';
import './components/kanji-meanings';
import './components/kanji-readings';
import { parseData } from './parse-data';

const kanjiContainer = assertReturn(document.querySelector('#kanji'));
const infoContainer = assertReturn(document.querySelector('#info'));

const data = parseData(`{{Data}}`);

render(
	html`
		<kanji-main .kanji=${data.kanji} drawing showGridToggle showDrawingToggle showUndoButton showClearButton></kanji-main>
	`,
	kanjiContainer,
);

render(
	html`
		<kanji-meanings .meanings=${data.meanings} .keyword=${data.keyword}></kanji-meanings>
		<kanji-readings .onyomi=${data.onyomi} .kunyomi=${data.kunyomi}></kanji-readings>
	`,
	infoContainer,
);
