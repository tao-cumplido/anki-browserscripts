import type { TemplateResult } from 'lit-element';
import type { TargetEvent } from 'misc-util';
import { css, customElement, html, LitElement } from 'lit-element';
import { until } from 'lit-html/directives/until';

import anki from '../anki';

@customElement('deck-select')
export class DeckSelect extends LitElement {
	private static readonly storageKey = 'kanji:deck';

	static readonly styles = css`
		:host {
			display: flex;
			flex-direction: column;
		}
	`;

	static get value(): string | null {
		return localStorage.getItem(DeckSelect.storageKey);
	}

	private readonly isOnline = anki.isOnline();
	private readonly decks = this.isOnline.then((isOnline) => (isOnline ? anki.decks() : []));
	private readonly disabled = this.decks.then((decks) => !decks.length);

	private readonly changeHandler = (event: TargetEvent<HTMLSelectElement>) => {
		localStorage.setItem(DeckSelect.storageKey, event.currentTarget.value);
	};

	private async options() {
		const isOnline = await this.isOnline;

		if (!isOnline) {
			return html`<option selected>Anki is offline</option>`;
		}

		const decks = await this.decks;
		const selectedDeck = DeckSelect.value;

		if (!(decks as unknown[]).includes(selectedDeck)) {
			localStorage.removeItem(DeckSelect.storageKey);
		}

		if (decks.length) {
			return decks.map((deck) => html`<option ?selected=${deck === selectedDeck}>${deck}</option>`);
		}

		return html`<option selected>-- no decks available</option>`;
	}

	render(): TemplateResult {
		return html`
			<label>Deck to add kanji-cards</label>
			<select @change=${this.changeHandler} ?disabled=${until(this.disabled, true)}>
				${until(this.options(), html`<option selected>connecting to Anki</option>`)}
			</select>
		`;
	}
}
