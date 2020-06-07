import { KanjiEntry } from '../../../kanji';
import { createDom } from './create-dom';

export function renderMeanings(container: Element, data: KanjiEntry) {
   container.append(
      ...createDom(`
         <div id="meanings">
            ${data.meanings.join('\u2002・\u2002')}
         </div>
      `),
   );
}
