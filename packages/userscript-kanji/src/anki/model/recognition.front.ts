import { createCanvas } from './script/create-canvas';
import { parseData } from './script/parse-data';
import { renderStrokes } from './script/render-strokes';

const container = document.querySelector('#canvas');

if (!container) {
   throw new Error(`unexpected error: #canvas element missing in dom`);
}

const data = parseData(`{{Data}}`);

if (data.strokes) {
   const svg = createCanvas();
   renderStrokes(svg, data.strokes);
   container.append(svg);
} else {
   container.textContent = `{{Kanji}}`;
}
