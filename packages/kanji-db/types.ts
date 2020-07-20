export interface Readings {
   frequent: string[];
   common: string[];
   rare: string[];
}

export interface FrequencyInfo {
   rank: number;
   siblings: string[];
}

export interface FrequencyRanks {
   mean: FrequencyInfo;
   literature?: FrequencyInfo;
   news?: FrequencyInfo;
   twitter?: FrequencyInfo;
   wikipedia?: FrequencyInfo;
}

export interface KanjiEntry {
   kanji: string;
   meanings: string[];
   onyomi?: Readings;
   kunyomi?: Readings;
   frequency?: FrequencyRanks;
   strokes?: string[];
}
