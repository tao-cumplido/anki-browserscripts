import parse from 'parse';

import { Extension } from './extension';
import styles from './extension.scss';
import { Sanseido } from './sites/sanseido';

const sites: Partial<Record<string, new () => Extension>> = {
   'www.sanseido.biz': Sanseido,
};

const KanjiExtension = sites[location.hostname];

if (!KanjiExtension) {
   throw new Error(`no extension found for site: ${location.hostname}`);
}

GM_addStyle(styles);

parse.serverURL = PARSE_SERVER_URL;
parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);

new KanjiExtension().run().catch(console.error);
