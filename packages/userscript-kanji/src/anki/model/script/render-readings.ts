import { KanjiEntry, Reading } from '../../../kanji';
import { createDom } from '../../../util/create-dom';

function renderReadingBlock(container: Element, label: string, data: Record<string, Reading>) {
   const [block] = createDom(`
      <div>
         <span class="label">
            ${label}
         </span>
      </div>
   `);

   for (const [reading, type] of Object.entries(data)) {
      block.append(...createDom(`<span class="${type}">${reading}</span>`));
   }

   container.append(block);
}

export function renderReadings(container: Element, data: KanjiEntry) {
   const [readings] = createDom(`<div id="readings"></div>`);

   if (data.onyomi) {
      renderReadingBlock(readings, '音', data.onyomi);
   }

   if (data.kunyomi) {
      renderReadingBlock(readings, '訓', data.kunyomi);
   }

   container.append(readings);
}
