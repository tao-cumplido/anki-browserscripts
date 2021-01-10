import type { TemplateResult } from 'lit-html';
import { html, property, unsafeCSS, LitElement } from 'lit-element';
import { nothing } from 'lit-html';

import { safeCustomElement } from '@~internal/dom';

import type { FrequencyRanks } from '../../../../../types';
import styles from './kanji-frequencies.scss';

@safeCustomElement('kanji-frequencies')
export class KanjiFrequencies extends LitElement {
	static readonly styles = unsafeCSS(styles);

	@property({ attribute: false })
	ranks: FrequencyRanks = { mean: 0 };

	private renderBlock(label: string, rank: number) {
		return html`
			<li>
				<span class="label">${label}</span>
				<span class="rank">${rank}</span>
			</li>
		`;
	}

	render(): TemplateResult {
		return html`
			<ul>
				<!-- prettier-ignore -->
				${this.renderBlock('Mean', this.ranks.mean)}
				${this.ranks.literature ? this.renderBlock('Literature', this.ranks.literature) : nothing}
				${this.ranks.news ? this.renderBlock('News', this.ranks.news) : nothing}
				${this.ranks.twitter ? this.renderBlock('Twitter', this.ranks.twitter) : nothing}
				${this.ranks.wikipedia ? this.renderBlock('Wikipedia', this.ranks.wikipedia) : nothing}
			</ul>
		`;
	}
}
