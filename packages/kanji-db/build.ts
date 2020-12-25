/* eslint-disable no-console */
import path from 'path';

import type { MappedRecord } from 'misc-util';
import csvParse from 'csv-parse/lib/sync';
import xml from 'fast-xml-parser';
import { ensureDirSync, readdirSync, readFileSync, readJsonSync, writeJson } from 'fs-extra';

import type { KanjiEntry, Readings } from './types';

const enum Kanjium {
	Kanji = 0,
	Onyomi = 6,
	Kunyomi = 7,
}

type FrequencySet = Record<string, number>;
type FrequencyGroups = Record<string, FrequencySet>;

type XmlNode<A extends string> = Record<A | '#text', string>;

interface KanjiDic {
	kanjidic2: {
		/* eslint-disable @typescript-eslint/naming-convention */
		header: {
			file_version: number;
			database_version: string;
			date_of_creation: string;
		};
		character: Array<{
			literal: string;
			reading_meaning?: {
				rmgroup: {
					reading?: XmlNode<'@_r_type'> | Array<XmlNode<'@_r_type'>>;
					meaning: string | Array<string | Record<string, unknown>>;
				};
			};
		}>;
		/* eslint-enable @typescript-eslint/naming-convention */
	};
}

interface RtkEntry {
	/* eslint-disable @typescript-eslint/naming-convention */
	kanji: string;
	keyword_5th_ed: string;
	keyword_6th_ed: string;
	/* eslint-enable @typescript-eslint/naming-convention */
}

const printProgress = (message: string, current: number, total: number) => {
	process.stdout.cursorTo(0);
	process.stdout.write(`${message} (${current}/${total})`);
	if (current === total) {
		process.stdout.write('\n');
	}
};

const frequencies = ['aozora', 'news', 'twitter', 'wikipedia'].reduce<FrequencyGroups>(
	(result, source) => {
		const sourcePath = path.join(require.resolve(`kanji-frequency/${source}.json`));
		const entries = (readJsonSync(sourcePath) as unknown) as Array<[string, number]>;

		entries.shift();

		result[source] = entries.reduce<FrequencySet>((set, [kanji, count]) => {
			set[kanji] = count;

			if (kanji in result.all) {
				result.all[kanji] += count;
			} else {
				result.all[kanji] = count;
			}

			return set;
		}, {});

		return result;
	},
	{ all: {} },
);

const frequencyRanks = Object.fromEntries(
	Object.entries(frequencies).map(([key, frequencySet]) => [
		key,
		Object.entries(
			Object.entries(frequencySet).reduce<Record<number, string[] | undefined>>((result, [kanji, count]) => {
				const entry = result[count] ?? [];
				entry.push(kanji);
				result[count] = entry;
				return result;
			}, {}),
		)
			.sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
			.reduce<Record<string, number>>((result, [_, kanjis], index) => {
				for (const kanji of kanjis ?? []) {
					result[kanji] = index + 1;
				}
				return result;
			}, {}),
	]),
);

const kanjivgPath = path.join(path.dirname(require.resolve('kanjivg/README')), 'kanji');

const strokes = readdirSync(kanjivgPath)
	.filter((file) => /^\p{ASCII_Hex_Digit}+\.svg$/u.exec(file))
	.map((file) => [String.fromCodePoint(parseInt(file, 16)), file])
	.filter(([char]) => /\p{sc=Han}/u.exec(char))
	.reduce<Partial<Record<string, string[]>>>((result, [kanji, file], index, { length }) => {
		printProgress(`reading strokes for: ${kanji}`, index + 1, length);
		const data = readFileSync(path.join(kanjivgPath, file), 'utf-8');
		result[kanji] = [...data.matchAll(/(?<=<path.+ d=").+?(?=")/gu)].map(([d]) => d);
		return result;
	}, {});

console.log('reading kanjium source');

const kanjium = readFileSync(require.resolve('kanjium/data/source_files/kanjidict.txt'), 'utf-8')
	.split('\n')
	.map((entry) => entry.split('\t'))
	.filter(({ length }) => length > 0)
	.filter(([kanji]) => /\p{sc=Han}/u.exec(kanji));

console.log('reading heisig-rtk source');

const rtk = (csvParse(readFileSync(require.resolve('heisig-rtk/heisig-kanjis.csv'), 'utf-8'), { columns: true }) as unknown) as RtkEntry[];

console.log('reading kanjidic source');

const {
	kanjidic2: { character: kanjidic },
} = (xml.parse(readFileSync(path.resolve(__dirname, 'kanjidic2.xml'), 'utf-8'), { ignoreAttributes: false }) as unknown) as KanjiDic;

const collectReadings = (kanjiumReadings?: string[]) => (result: MappedRecord<Readings, Set<string>>, reading: string) => {
	if (reading.includes('.')) {
		result.okurigana?.add(reading);
		[reading] = reading.split('.');
	}

	if (kanjiumReadings?.includes(`${reading}*`)) {
		result.common.add(reading);
	} else if (kanjiumReadings?.includes(reading)) {
		result.frequent.add(reading);
	} else if (kanjiumReadings?.length) {
		result.rare.add(reading);
	} else {
		result.common.add(reading);
	}

	return result;
};

const mapReadingSets = (readings: MappedRecord<Readings, Set<string>>) => {
	const entries = Object.entries(readings);

	if (!entries.some(([_, set]) => set?.size)) {
		return;
	}

	return (Object.fromEntries(entries.map(([key, set]) => [key, [...(set ?? [])]])) as unknown) as Readings;
};

const generateFrequencyInfo = (source: Partial<Record<string, number>>, kanji: string) => source[kanji];

const dataPath = path.resolve(__dirname, 'data');

ensureDirSync(dataPath);

kanjidic
	.filter((entry): entry is Required<typeof entry> => 'reading_meaning' in entry)
	.forEach((entry, index, { length }) => {
		const kanji = entry.literal;

		printProgress(`processing entry for: ${kanji}`, index + 1, length);

		const kanjiumEntry = kanjium.find(($) => $[Kanjium.Kanji] === kanji);

		const onyomi = [entry.reading_meaning.rmgroup.reading ?? []]
			.flat()
			.filter((reading) => reading['@_r_type'] === 'ja_on')
			.map((reading) => reading['#text'])
			.reduce(collectReadings(kanjiumEntry?.[Kanjium.Onyomi].split('、')), {
				frequent: new Set<string>(),
				common: new Set<string>(),
				rare: new Set<string>(),
			});

		const kunyomi = [entry.reading_meaning.rmgroup.reading ?? []]
			.flat()
			.filter((reading) => reading['@_r_type'] === 'ja_kun')
			.map((reading) => reading['#text'].replace('-', ''))
			.reduce(collectReadings(kanjiumEntry?.[Kanjium.Kunyomi].replace(/（(\p{sc=Hiragana}+?)）/gu, '').split('、')), {
				frequent: new Set<string>(),
				common: new Set<string>(),
				rare: new Set<string>(),
				okurigana: new Set<string>(),
			});

		const meanings = [entry.reading_meaning.rmgroup.meaning].flat().filter(($): $ is string => typeof $ === 'string');

		let frequency;

		if (kanji in frequencyRanks.all) {
			frequency = {
				mean: generateFrequencyInfo(frequencyRanks.all, kanji) ?? 1,
				literature: generateFrequencyInfo(frequencyRanks.aozora, kanji),
				news: generateFrequencyInfo(frequencyRanks.news, kanji),
				twitter: generateFrequencyInfo(frequencyRanks.twitter, kanji),
				wikipedia: generateFrequencyInfo(frequencyRanks.wikipedia, kanji),
			};
		}

		let keyword;

		const rtkEntry = rtk.find(($) => $.kanji === kanji);

		if (rtkEntry) {
			keyword = rtkEntry.keyword_6th_ed || rtkEntry.keyword_5th_ed;
		}

		const result: KanjiEntry = {
			kanji,
			meanings,
			keyword,
			onyomi: mapReadingSets(onyomi),
			kunyomi: mapReadingSets(kunyomi),
			frequency,
			strokes: strokes[kanji],
		};

		if (!meanings.length || !keyword || !result.onyomi || !result.kunyomi || !frequency || !result.strokes) {
			return;
		}

		writeJson(path.join(dataPath, `${kanji}.json`), result, { spaces: '\t' }).catch(console.error);
	});
