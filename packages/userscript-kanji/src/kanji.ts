export const enum Reading {
   Frequent = 'f',
   Common = 'c',
   Rare = 'r',
}

export type FrequencyEntry = [number, ...string[]];

export interface FrequencyRanks {
   mean: FrequencyEntry;
   literature?: FrequencyEntry;
   news?: FrequencyEntry;
   twitter?: FrequencyEntry;
   wikipedia?: FrequencyEntry;
}

export interface KanjiEntry {
   meanings: string[];
   onyomi?: Record<string, Reading>;
   kunyomi?: Record<string, Reading>;
   frequency?: FrequencyRanks;
   strokes?: string[];
}
