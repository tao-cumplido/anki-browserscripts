import { KanjiEntry, Readings } from 'kanji-db';

import { createHtmlElements } from '../../../util/create-html-elements';

function renderReadingBlock(container: Element, label: string, data: Readings) {
   const [block] = createHtmlElements(`
      <div>
         <span class="label">
            ${label}
         </span>
      </div>
   `);

   for (const reading of data.frequent) {
      block.append(...createHtmlElements(`<span class="frequent">${reading}</span>`));
   }

   for (const reading of data.common) {
      block.append(...createHtmlElements(`<span class="common">${reading}</span>`));
   }

   for (const reading of data.rare) {
      block.append(...createHtmlElements(`<span class="rare">${reading}</span>`));
   }

   container.append(block);
}

export function renderReadings(container: Element, data: KanjiEntry) {
   const [readings] = createHtmlElements(`<div id="readings"></div>`);

   if (data.onyomi) {
      renderReadingBlock(readings, '音', data.onyomi);
   }

   if (data.kunyomi) {
      renderReadingBlock(readings, '訓', data.kunyomi);
   }

   container.append(readings);
}
