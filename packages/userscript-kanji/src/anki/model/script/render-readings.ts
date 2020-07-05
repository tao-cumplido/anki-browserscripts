import { KanjiEntry, Reading } from '../../../kanji';
import { createHtmlElements } from '../../../util/create-html-elements';

function renderReadingBlock(container: Element, label: string, data: Record<string, Reading>) {
   const [block] = createHtmlElements(`
      <div>
         <span class="label">
            ${label}
         </span>
      </div>
   `);

   for (const [reading, type] of Object.entries(data)) {
      block.append(...createHtmlElements(`<span class="${type}">${reading}</span>`));
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
