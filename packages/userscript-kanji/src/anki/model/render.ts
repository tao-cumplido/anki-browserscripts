import { FrequencyEntry, FrequencyRanks, KanjiEntry, Reading } from '../../kanji';

export function renderMeanings(container: Element, data: KanjiEntry) {
   const meanings = document.createElement('div');
   meanings.id = 'meanings';
   meanings.textContent = data.meanings.join('\u2002・\u2002');
   container.append(meanings);
}

function renderReadingBlock(container: Element, label: string, data: Record<string, Reading>) {
   const block = document.createElement('div');
   const labelElement = document.createElement('span');

   labelElement.classList.add('label');
   labelElement.textContent = label;

   block.append(labelElement);

   for (const [reading, type] of Object.entries(data)) {
      const element = document.createElement('span');
      element.classList.add(type);
      element.textContent = reading;
      block.append(element);
   }

   container.append(block);
}

export function renderReadings(container: Element, data: KanjiEntry) {
   const readings = document.createElement('div');
   readings.id = 'readings';

   if (data.onyomi) {
      renderReadingBlock(readings, '音', data.onyomi);
   }

   if (data.kunyomi) {
      renderReadingBlock(readings, '訓', data.kunyomi);
   }

   container.append(readings);
}

function renderFrequencyBlock(container: Element, label: string, entry: FrequencyEntry) {
   const block = document.createElement('div');

   const [rank, ...otherKanjis] = entry;

   if (otherKanjis.length) {
      block.innerHTML = `
         <details>
            <summary>
               <span class="label">${label}</span>
               <span class="rank">${rank}</span>
            </summary>
            <div>
               ${otherKanjis.map((kanji) => `<span>${kanji}</span>`).join('')}
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
