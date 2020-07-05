import { createSvgElements } from '../../../util/create-svg-elements';

export function renderStrokes(container: SVGElement, strokes: string[]) {
   container.append(
      ...createSvgElements<SVGPathElement>(`
         <g class="strokes-group">
            <g class="guides">
               ${strokes.map((stroke) => `<path class="guide" d="${stroke}"></path>`).join('')}
            </g>
            <g class="strokes">
               ${strokes.map((stroke) => `<path class="stroke" d="${stroke}"></path>`).join('')}
            </g>
         </g>
      `),
   );
}
