export interface Readings {
   frequent: string[];
   common: string[];
   rare: string[];
   okurigana?: string[];
}

export interface FrequencyRanks {
   mean: number;
   literature?: number;
   news?: number;
   twitter?: number;
   wikipedia?: number;
}

export interface KanjiEntry {
   kanji: string;
   meanings: string[];
   onyomi?: Readings;
   kunyomi?: Readings;
   frequency?: FrequencyRanks;
   strokes?: string[];
}
