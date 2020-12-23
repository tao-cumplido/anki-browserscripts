import { html, render } from 'lit-html';
import { assert } from 'misc-util';

import './script/kanji-main';
import { parseData } from './script/parse-data';

const container = assert(document.querySelector('#kanji'));

const data = parseData(`{{Data}}`);

render(html`<kanji-main .kanji=${data.kanji} .strokes=${data.strokes ?? []}></kanji-main>`, container);
