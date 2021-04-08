import { html, render } from 'lit-html';

import { assertReturn } from '@~internal/util';

import './components/kanji-main';
import { parseData } from './parse-data';

const container = assertReturn(document.querySelector('#kanji'));

const data = parseData(`{{Data}}`);

render(html`<kanji-main .kanji=${data.kanji} .strokes=${data.strokes ?? []}></kanji-main>`, container);
