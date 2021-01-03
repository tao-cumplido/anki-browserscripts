import type { KanjiEntry } from '../../../../types';

export function parseData(data: string): KanjiEntry {
	try {
		return (JSON.parse(data) as unknown) as KanjiEntry;
	} catch {
		return {
			kanji: 'X',
			meanings: ['meaning 1', 'meaning 3'],
			keyword: 'test',
			onyomi: {
				frequent: ['こう'],
				common: ['そう'],
				rare: ['よう'],
			},
			kunyomi: {
				frequent: ['こう'],
				common: ['そう'],
				rare: ['よう'],
			},
			strokes: [
				'M50.75,19.5c0.1,1.3,0.37,3.74-0.19,5.21C43.57,43,32.73,60.29,14.5,75.04',
				'M45,44.35c1.05,0,3.62,0.35,6.26,0.1c9.18-0.85,25.21-3.31,29.06-3.67c4.26-0.4,6.46,4.28,4.68,6.25C78.32,54.46,67.5,67,57.81,79.22',
				'M42.52,68.33c10.16,5.01,26.25,20.59,28.79,28.38',
			],
			frequency: {
				mean: 1,
				news: 50,
			},
		};
	}
}
