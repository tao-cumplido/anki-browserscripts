import { parseData } from './script/parse-data';
import { renderStrokes } from './script/render-strokes';

const container = document.querySelector('#kanji');

if (!container) {
   throw new Error(`unexpected error: #kanji element missing in dom`);
}

const data = parseData(`{{Data}}`);

if (data.strokes) {
   renderStrokes(container, data.strokes);
} else {
   container.textContent = `{{Kanji}}`;
}
