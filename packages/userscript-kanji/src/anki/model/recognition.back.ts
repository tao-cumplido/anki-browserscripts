import { animateStrokes } from './script/animate-strokes';
import { createDom } from './script/create-dom';
import { parseData } from './script/parse-data';
import { renderFrequencies } from './script/render-frequencies';
import { renderMeanings } from './script/render-meanings';
import { renderReadings } from './script/render-readings';

const container = document.querySelector('#info');

if (!container) {
   throw new Error(`unexpected error: #info element missing in dom`);
}

const data = parseData(`{{Data}}`);

renderMeanings(container, data);
renderReadings(container, data);

if (data.frequency) {
   renderFrequencies(container, data.frequency);
}

if (data.strokes) {
   const strokes = document.querySelectorAll('path');
   const [button] = createDom<HTMLButtonElement>(`<button>▶</button>`);

   button.onclick = () => animateStrokes(strokes);

   document.querySelector('.side.right')?.append(button);

   animateStrokes(strokes);
}
