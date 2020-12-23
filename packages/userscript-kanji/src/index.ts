import parse from 'parse';

import type { Extension } from './extension';
import { Jisho } from './sites/jisho';

const sites: Partial<Record<string, new () => Extension>> = {
	'jisho.org': Jisho,
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const KanjiExtension = sites[location.hostname];

if (!KanjiExtension) {
	throw new Error(`no extension found for site: ${location.hostname}`);
}

parse.serverURL = PARSE_SERVER_URL;
parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);

new KanjiExtension().run().catch(console.error);
