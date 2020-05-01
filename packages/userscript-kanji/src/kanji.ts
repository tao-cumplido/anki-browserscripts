export const enum Reading {
   Frequent = 'f',
   Common = 'c',
   Rare = 'r',
}

export interface FrequencyRanks {
   mean: number;
   literature?: number;
   news?: number;
   twitter?: number;
   wikipedia?: number;
}

export interface KanjiEntry {
   meanings: string[];
   onyomi?: Record<string, Reading>;
   kunyomi?: Record<string, Reading>;
   frequency?: FrequencyRanks;
   strokes?: string[];
}
