import mdiLayersOff from '@mdi/svg/svg/layers-off.svg';
import mdiLayers from '@mdi/svg/svg/layers.svg';
import mdiPlay from '@mdi/svg/svg/play.svg';

import { animateStrokes } from './script/animate-strokes';
import { iconButton, iconToggleButton } from './script/icon-button';
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
   const strokes = document.querySelectorAll<SVGPathElement>('path.stroke');
   const guides = document.querySelector<SVGElement>('g.guides');

   if (!guides) {
      throw new Error(`unexpected error: .guides element missing in dom`);
   }

   document.querySelector('.side.right')?.append(
      iconToggleButton(mdiLayers, mdiLayersOff, (state) => {
         guides.style.opacity = state ? '1' : '0';
      }),
   );

   document.querySelector('.side.right')?.append(iconButton(mdiPlay, () => animateStrokes(strokes)));

   animateStrokes(strokes);
}
