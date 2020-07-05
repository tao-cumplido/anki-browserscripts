import { KanjiEntry } from '../../../kanji';
import { createHtmlElements } from '../../../util/create-html-elements';

export function renderMeanings(container: Element, data: KanjiEntry) {
   container.append(
      ...createHtmlElements(`
         <div id="meanings">
            ${data.meanings.join('\u2002・\u2002')}
         </div>
      `),
   );
}
