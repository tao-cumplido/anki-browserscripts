import { createDom } from './create-dom';

export function renderStrokes(container: Element, strokes: string[]) {
   container.append(
      ...createDom(`
         <div class="side left"></div>
         <div id="strokes">
            <svg viewBox="0 0 109 109">
               <line x1="0" y1="0" x2="109" y2="109"></line>
               <line x1="0" y1="109" x2="109" y2="0"></line>
               <line x1="0" y1="54.5" x2="109" y2="54.5"></line>
               <line x1="54.5" y1="0" x2="54.5" y2="109"></line>
               ${strokes.map((stroke) => `<path d="${stroke}"></path>`).join()}
            </svg>
         </div>
         <div class="side right"></div>
      `),
   );
}
