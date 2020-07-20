import path from 'path';

import 'dotenv/config';
import { readdirSync, readFileSync, readJsonSync } from 'fs-extra';
import parse from 'parse/node';

import { FrequencyInfo, KanjiEntry, Readings } from './types';

const enum KanjidictColumn {
   Kanji = 0,
   RegularOnyomi = 6,
   RegularKunyomi = 7,
   Onyomi = 8,
   Kunyomi = 9,
   Meaning = 16,
   CompactMeaning = 17,
}

type FrequencySet = Record<string, number>;
type FrequencyGroups = Record<string, FrequencySet>;

const { PARSE_SERVER_URL, PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY, PARSE_MASTER_KEY } = process.env;

if (!PARSE_SERVER_URL || !PARSE_APPLICATION_ID || !PARSE_JAVASCRIPT_KEY || !PARSE_MASTER_KEY) {
   throw new Error(`missing env variables for Parse server config`);
}

parse.serverURL = PARSE_SERVER_URL;
parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY, PARSE_MASTER_KEY);
parse.Cloud.useMasterKey();

const Kanji = (parse.Object.extend('Kanji') as unknown) as new () => parse.Object<KanjiEntry>;

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
   Object.entries(frequencies).map(([key, frequencySet]) => {
      return [
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
      ];
   }),
);

const kanjivgPath = path.join(path.dirname(require.resolve('kanjivg/README')), 'kanji');

const strokes = readdirSync(kanjivgPath)
   .filter((file) => /^\p{ASCII_Hex_Digit}+\.svg$/u.exec(file))
   .map((file) => [String.fromCodePoint(parseInt(file, 16)), file])
   .filter(([char]) => /\p{sc=Han}/u.exec(char))
   .reduce<Partial<Record<string, string[]>>>((result, [kanji, file], index, { length }) => {
      console.log(`reading strokes for: ${kanji} (${index + 1}/${length})`);
      const data = readFileSync(path.join(kanjivgPath, file), 'utf-8');
      result[kanji] = [...data.matchAll(/(?<=<path.+ d=").+?(?=")/g)].map(([d]) => d);
      return result;
   }, {});

console.log('reading kanjium source');

const kanjidict = readFileSync(require.resolve('kanjium/data/source_files/kanjidict.txt'), 'utf-8')
   .split('\n')
   .map((entry) => entry.split('\t'))
   .filter(({ length }) => length > 0)
   .filter(([kanji]) => /\p{sc=Han}/u.exec(kanji));

const collectReadings = (source: string[]) => (result: Readings, reading: string) => {
   if (source.includes(`${reading}*`)) {
      result.frequent.push(reading);
   } else if (source.includes(reading)) {
      result.common.push(reading);
   } else {
      result.rare.push(reading);
   }

   return result;
};

const generateFrequencyInfo = (source: Partial<Record<string, number>>, kanji: string): FrequencyInfo | undefined => {
   const rank = source[kanji];

   if (rank === undefined) {
      return;
   }

   return {
      rank,
      siblings: Object.entries(source)
         .filter(([k, r]) => k !== kanji && r === rank)
         .map(([k]) => k),
   };
};

async function build() {
   for (const [index, entry] of kanjidict.entries()) {
      const kanji = entry[KanjidictColumn.Kanji];

      console.log(`processing entry for: ${kanji} (${index + 1}/${kanjidict.length})`);

      const regularOnyomi = entry[KanjidictColumn.RegularOnyomi].split('、');
      const regularKunyomi = entry[KanjidictColumn.RegularKunyomi]
         .replace(/（(\p{sc=Hiragana}+?)）/gu, '.$1')
         .split('、');

      const onyomi = entry[KanjidictColumn.Onyomi]
         .replace(/\(\p{sc=Han}\)/gu, '')
         .split('、')
         .reduce(collectReadings(regularOnyomi), {
            frequent: [],
            common: [],
            rare: [],
         });

      const kunyomi = entry[KanjidictColumn.Kunyomi]
         .replace(/（(\p{sc=Hiragana}+?)）/gu, '.$1')
         .split('、')
         .reduce(collectReadings(regularKunyomi), {
            frequent: [],
            common: [],
            rare: [],
         });

      const meanings = entry[KanjidictColumn.Meaning].split(';');
      const compactMeanings = entry[KanjidictColumn.CompactMeaning].split(';');

      let frequency;

      if (kanji in frequencyRanks.all) {
         frequency = {
            mean: generateFrequencyInfo(frequencyRanks.all, kanji) ?? { rank: 1, siblings: [] },
            literature: generateFrequencyInfo(frequencyRanks.aozora, kanji),
            news: generateFrequencyInfo(frequencyRanks.news, kanji),
            twitter: generateFrequencyInfo(frequencyRanks.twitter, kanji),
            wikipedia: generateFrequencyInfo(frequencyRanks.wikipedia, kanji),
         };
      }

      const parseInstance = await new parse.Query(Kanji)
         .equalTo('kanji', kanji)
         .find()
         .then((results) => (results.length ? results[0] : new Kanji()));

      parseInstance.set('kanji', kanji);
      parseInstance.set('meanings', compactMeanings[0] ? compactMeanings : meanings);
      parseInstance.set('onyomi', Object.keys(onyomi).length ? onyomi : undefined);
      parseInstance.set('kunyomi', Object.keys(kunyomi).length ? kunyomi : undefined);
      parseInstance.set('frequency', frequency);
      parseInstance.set('strokes', strokes[kanji]);

      await parseInstance.save();
   }
}

build().catch(console.error);
