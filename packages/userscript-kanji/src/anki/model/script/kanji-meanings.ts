import type { TemplateResult } from 'lit-element';
import { html, property, unsafeCSS, LitElement } from 'lit-element';
import { safeCustomElement } from 'misc-util';

import styles from './kanji-meanings.scss';

@safeCustomElement('kanji-meanings')
export class KanjiMeanings extends LitElement {
	static readonly styles = unsafeCSS(styles);

	@property({ attribute: false })
	meanings: string[] = [];

	@property({ attribute: false })
	keyword?: string;

	private format(meanings: string[]) {
		return meanings.join('\u2002・\u2002');
	}

	render(): TemplateResult {
		if (this.keyword) {
			const meanings = new Set(this.meanings);

			meanings.delete(this.keyword);

			return html`
				<details class="meanings">
					<summary>${this.keyword}</summary>
					<div>${this.format([...meanings])}</div>
				</details>
			`;
		}

		return html`<div class="meanings">${this.format(this.meanings)}</div>`;
	}
}
