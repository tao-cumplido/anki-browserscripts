import { KanjiEntry, Readings } from 'kanji-db';
import { createHtmlElements } from 'script-util';

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

   // for (const reading of data.rare) {
   //    block.append(...createHtmlElements(`<span class="rare">${reading}</span>`));
   // }

   if (data.rare.length) {
      block.append(
         ...createHtmlElements(`
            <details>
               <summary>rare</summary>
               <div>
                  ${data.rare.map((reading) => `<span class="rare">${reading}</span>`).join('')}
               </div>
            </details>
         `),
      );
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
