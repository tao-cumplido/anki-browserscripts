import { createDom } from './create-dom';

export function renderStrokes(container: Element, strokes: string[]) {
   container.append(
      ...createDom(`
         <div class="side left"></div>
         <div id="strokes">
            <svg viewBox="0 0 109 109">
               ${strokes.map((stroke) => `<path d="${stroke}"></path>`).join()}
            </svg>
         </div>
         <div class="side right"></div>
      `),
   );
}
