import { createHtmlElements } from '../../../util/create-html-elements';

export function createCanvas() {
   const [svg] = createHtmlElements<SVGElement>(`
      <svg viewBox="0 0 109 109">
         <g class="grid">
            <line x1="0" y1="0" x2="109" y2="109"></line>
            <line x1="0" y1="109" x2="109" y2="0"></line>
            <line x1="0" y1="54.5" x2="109" y2="54.5"></line>
            <line x1="54.5" y1="0" x2="54.5" y2="109"></line>
         </g>
      </svg>
   `);

   return svg;
}
