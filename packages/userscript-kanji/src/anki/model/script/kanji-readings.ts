import type { Readings } from 'kanji-db';
import type { TemplateResult } from 'lit-html';
import { html, property, unsafeCSS, LitElement } from 'lit-element';
import { nothing } from 'lit-html';
import { safeCustomElement } from 'misc-util';

import styles from './kanji-readings.scss';

@safeCustomElement('kanji-readings')
export class KanjiReadings extends LitElement {
	static readonly styles = unsafeCSS(styles);

	@property({ attribute: false })
	onyomi?: Readings;

	@property({ attribute: false })
	kunyomi?: Readings;

	private aggregateReadings(style: string) {
		return (reading: string) => html`<span class=${style}>${reading}</span>`;
	}

	private renderOkurigana(okurigana: string[]) {
		return html`
			<details>
				<summary>okurigana</summary>
				<div>${okurigana.map(this.aggregateReadings('okurigana'))}</div>
			</details>
		`;
	}

	private renderBlock(label: string, readings: Readings) {
		return html`
			<div>
				<span class="label">${label}</span>
				${readings.frequent.map(this.aggregateReadings('frequent'))} ${readings.common.map(this.aggregateReadings('common'))}
				${readings.rare.map(this.aggregateReadings('rare'))} ${readings.okurigana?.length ? this.renderOkurigana(readings.okurigana) : nothing}
			</div>
		`;
	}

	render(): TemplateResult {
		return html`${this.onyomi ? this.renderBlock('音', this.onyomi) : nothing} ${this.kunyomi ? this.renderBlock('訓', this.kunyomi) : nothing}`;
	}
}
