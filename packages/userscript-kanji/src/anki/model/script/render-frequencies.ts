import { FrequencyInfo, FrequencyRanks } from 'kanji-db';

function renderFrequencyBlock(container: Element, label: string, { rank, siblings }: FrequencyInfo) {
   const block = document.createElement('div');

   if (siblings.length) {
      block.innerHTML = `
         <details>
            <summary>
               <span class="label">${label}</span>
               <span class="rank">${rank}</span>
            </summary>
            <div>
               ${siblings.map((kanji) => `<span>${kanji}</span>`).join('')}
            </div>
         </details>
      `;
   } else {
      block.innerHTML = `
         <div class="disabled-details">
            <span class="label">${label}</span>
            <span class="rank">${rank}</span>
         </div>
      `;
   }

   container.append(block);
}

export function renderFrequencies(container: Element, ranks: FrequencyRanks) {
   const frequencies = document.createElement('div');
   frequencies.id = 'frequencies';

   renderFrequencyBlock(frequencies, 'Mean', ranks.mean);

   if (ranks.literature) {
      renderFrequencyBlock(frequencies, 'Literature', ranks.literature);
   }

   if (ranks.news) {
      renderFrequencyBlock(frequencies, 'News', ranks.news);
   }

   if (ranks.twitter) {
      renderFrequencyBlock(frequencies, 'Twitter', ranks.twitter);
   }

   if (ranks.wikipedia) {
      renderFrequencyBlock(frequencies, 'Wikipedia', ranks.wikipedia);
   }

   container.append(frequencies);
}
