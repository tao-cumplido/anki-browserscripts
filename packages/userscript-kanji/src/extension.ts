import { KanjiEntry } from 'kanji-db';
import parse from 'parse';

export interface Extension {
   run(): Promise<void>;
}

export abstract class AbstractExtension implements Extension {
   readonly parseQuery = new parse.Query<parse.Object<KanjiEntry>>('Kanji');
   abstract run(): Promise<void>;
}
