import { html, render } from 'lit-html';

import { assert } from '@~internal/util';

import { AbstractExtension } from '../extension';
import styles from './jisho.scss';

export class Jisho extends AbstractExtension {
	constructor() {
		super();
		// @ts-expect-error: jisho includes SugarJS which adds a lot of stuff to prototypes
		// this one specifically makes lit-html fire event listeners only once
		// as far as I can tell jisho doesn't seem to use this specific feature of SugarJS
		delete Function.prototype.once;

		GM_addStyle(styles);
	}

	private filterKanji(text: string) {
		return [...new Set(text.match(/\p{sc=Han}/gmu))];
	}

	private renderConfig() {
		const container = this.assertContainer('userscript-config');
		const column = document.createElement('div');

		container.classList.add('row');
		column.classList.add('column');

		container.append(column);
		document.body.insertBefore(container, assert(document.querySelector('#page_container')));

		render(html`<deck-select></deck-select>`, column);

		return column;
	}

	private renderVocabResults() {
		for (const wrapper of document.querySelectorAll('#primary .concept_light-wrapper')) {
			try {
				const kanji = this.filterKanji(assert(wrapper.querySelector('ul[id^="links_drop"]')?.textContent));

				if (kanji.length) {
					const preselected = this.filterKanji(assert(wrapper.querySelector('.concept_light-readings')?.textContent));
					render(
						html`<kanji-select .kanji=${kanji} .preselected=${preselected}></kanji-select>`,
						wrapper.appendChild(document.createElement('div')),
					);
				}
			} catch {}
		}
	}

	private renderKanjiResults(query: string, container: Element) {
		const kanjiText = [...document.querySelectorAll(/\p{sc=Han}/u.exec(query) ? 'h1.character' : '.literal_block')]
			.map(({ textContent }) => textContent)
			.join('');

		render(
			html`<kanji-select class="vertical" .kanji=${this.filterKanji(kanjiText)} .preselected=${[]}></kanji-select>`,
			container.appendChild(document.createElement('div')),
		);
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async run(): Promise<void> {
		const query = decodeURIComponent(location.pathname.split('/')[2]);

		if (/#names$/u.exec(query)) {
			return;
		}

		if (/#sentences$/u.exec(query)) {
			return;
		}

		const configColumn = this.renderConfig();

		if (/#kanji$/u.exec(query)) {
			this.renderKanjiResults(query, configColumn);
			return;
		}

		this.renderVocabResults();
	}
}
