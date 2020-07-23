import { KanjiEntry } from 'kanji-db';
import { createHtmlElements } from 'script-util';

export function renderMeanings(container: Element, { meanings }: KanjiEntry) {
   container.append(
      ...createHtmlElements(`
         <div id="meanings">
            ${meanings.join('\u2002・\u2002')}
         </div>
      `),
   );
}
