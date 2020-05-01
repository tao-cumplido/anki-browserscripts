import path from 'path';

import { readdirSync, readFileSync, readJsonSync, writeJsonSync } from 'fs-extra';

import { KanjiEntry, Reading } from './src/kanji';

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
   .filter(({ length }) => length > 0);

const collectReadings = (source: string[]) => (result: Record<string, Reading>, reading: string) => {
   let type = Reading.Rare;

   if (source.includes(`${reading}*`)) {
      type = Reading.Frequent;
   } else if (source.includes(reading)) {
      type = Reading.Common;
   }

   result[reading] = type;

   return result;
};

const data = kanjidict
   .filter(([kanji]) => /\p{sc=Han}/u.exec(kanji))
   .reduce<Record<string, KanjiEntry>>((result, entry, index, { length }) => {
      const kanji = entry[KanjidictColumn.Kanji];

      console.log(`processing entry for: ${kanji} (${index + 1}/${length})`);

      const regularOnyomi = entry[KanjidictColumn.RegularOnyomi].split('、');
      const regularKunyomi = entry[KanjidictColumn.RegularKunyomi]
         .replace(/（(\p{sc=Hiragana}+?)）/gu, '.$1')
         .split('、');

      const onyomi = entry[KanjidictColumn.Onyomi]
         .replace(/\(\p{sc=Han}\)/gu, '')
         .split('、')
         .reduce(collectReadings(regularOnyomi), {});

      const kunyomi = entry[KanjidictColumn.Kunyomi]
         .replace(/（(\p{sc=Hiragana}+?)）/gu, '.$1')
         .split('、')
         .reduce(collectReadings(regularKunyomi), {});

      const meanings = entry[KanjidictColumn.Meaning].split(';');
      const compactMeanings = entry[KanjidictColumn.CompactMeaning].split(';');

      let frequency;

      if (kanji in frequencyRanks.all) {
         frequency = {
            mean: frequencyRanks.all[kanji],
            literature: frequencyRanks.aozora[kanji],
            news: frequencyRanks.news[kanji],
            twitter: frequencyRanks.twitter[kanji],
            wikipedia: frequencyRanks.wikipedia[kanji],
         };
      }

      result[kanji] = {
         meanings: compactMeanings[0] ? compactMeanings : meanings,
         onyomi: Object.keys(onyomi).length ? onyomi : undefined,
         kunyomi: Object.keys(kunyomi).length ? kunyomi : undefined,
         strokes: strokes[kanji],
         frequency,
      };

      return result;
   }, {});

writeJsonSync('src/data.json', data);
