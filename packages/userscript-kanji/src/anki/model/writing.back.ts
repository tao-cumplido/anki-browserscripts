import mdiEyeOff from '@mdi/svg/svg/eye-off.svg';
import mdiEye from '@mdi/svg/svg/eye.svg';
import mdiLayersOff from '@mdi/svg/svg/layers-off.svg';
import mdiLayers from '@mdi/svg/svg/layers.svg';
import mdiPlay from '@mdi/svg/svg/play.svg';

import { animateStrokes } from './script/animate-strokes';
import { drawLines, Line } from './script/draw';
import { iconButton, iconToggleButton } from './script/icon-button';
import { parseData } from './script/parse-data';
import { renderFrequencies } from './script/render-frequencies';
import { renderReadings } from './script/render-readings';
import { renderStrokes } from './script/render-strokes';

const context = document.querySelector('canvas')?.getContext('2d');

if (!context) {
   throw new Error(`unexpected error: missing canvas element`);
}

context.canvas.style.opacity = '0.5';
context.strokeStyle = 'rgb(0, 255, 0)';
context.fillStyle = context.strokeStyle;

if (Persistence.isAvailable()) {
   const lines = Persistence.getItem<Line[]>() ?? [];
   drawLines(context, lines);
}

const container = document.querySelector('#info');

if (!container) {
   throw new Error(`unexpected error: #info element missing in dom`);
}

const data = parseData(`{{Data}}`);

renderReadings(container, data);

if (data.frequency) {
   renderFrequencies(container, data.frequency);
}

if (data.strokes) {
   const svg = document.querySelector<SVGElement>('#canvas svg');

   if (!svg) {
      throw new Error(`unexpected error: missing svg element`);
   }

   renderStrokes(svg, data.strokes);

   const strokes = document.querySelectorAll<SVGPathElement>('path.stroke');
   const strokesGroup = document.querySelector<SVGElement>('g.strokes-group');
   const guidesGroup = document.querySelector<SVGElement>('g.guides');

   if (!guidesGroup || !strokesGroup) {
      throw new Error(`unexpected error: stroke elements missing in dom`);
   }

   document.querySelector('.side.right')?.append(
      iconToggleButton(mdiEye, mdiEyeOff, (state) => {
         strokesGroup.style.opacity = state ? '1' : '0';
      }),
   );

   document.querySelector('.side.right')?.append(
      iconToggleButton(mdiLayers, mdiLayersOff, (state) => {
         guidesGroup.style.opacity = state ? '1' : '0';
      }),
   );

   document.querySelector('.side.right')?.append(iconButton(mdiPlay, () => animateStrokes(strokes)));

   animateStrokes(strokes);
} else {
   container.textContent = `{{Kanji}}`;
}
