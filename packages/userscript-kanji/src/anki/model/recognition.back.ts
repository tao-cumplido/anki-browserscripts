import { KanjiEntry, Reading } from '../../kanji';
import { renderFrequencies, renderMeanings, renderReadings } from './render';

let data: KanjiEntry = {
   meanings: ['meaning 1', 'meaning 3'],
   onyomi: {
      こう: Reading.Frequent,
      そう: Reading.Common,
      よう: Reading.Rare,
   },
   kunyomi: {
      こう: Reading.Frequent,
      そう: Reading.Common,
      よう: Reading.Rare,
   },
   strokes: [
      'M50.75,19.5c0.1,1.3,0.37,3.74-0.19,5.21C43.57,43,32.73,60.29,14.5,75.04',
      'M45,44.35c1.05,0,3.62,0.35,6.26,0.1c9.18-0.85,25.21-3.31,29.06-3.67c4.26-0.4,6.46,4.28,4.68,6.25C78.32,54.46,67.5,67,57.81,79.22',
      'M42.52,68.33c10.16,5.01,26.25,20.59,28.79,28.38',
   ],
   frequency: {
      mean: [1],
      news: [50, '一', '二', '三'],
   },
};

try {
   data = (JSON.parse(`{{Data}}`) as unknown) as KanjiEntry;
} catch {}

const container = document.querySelector('#data');

if (!container) {
   throw new Error(`unexpected error: #data element missing in dom`);
}

renderMeanings(container, data);
renderReadings(container, data);

if (data.frequency) {
   renderFrequencies(container, data.frequency);
}
