import type { NotesInfoResult } from 'anki-connect';
import type { KanjiEntry } from 'kanji-db';
import type { TemplateResult } from 'lit-element';
import { css, customElement, html, internalProperty, property, LitElement } from 'lit-element';
import { nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map';
import 'misc-util/dom/inline-spinner';

import anki from '../anki';
import { DeckSelect } from './deck-select';

interface KanjiOption {
	kanji: string;
	hint: TemplateResult | typeof nothing;
	data?: KanjiEntry;
	disabled?: boolean;
	selected?: boolean;
	onClick?: () => void;
}

@customElement('kanji-select')
export class AddKanjiCards extends LitElement {
	private static readonly instances = new Set<AddKanjiCards>();

	private static readonly data = new Map<string, KanjiEntry>();
	private static readonly queries = new Map<string, Promise<void>>();

	static readonly styles = css`
		:host {
			display: flex;
			flex-direction: var(--kanji-select-flex-direction, row);
			align-items: start;
			gap: 5px;
		}

		.select {
			display: flex;
			flex-direction: var(--kanji-select-flex-direction, row);
			column-gap: 10px;
		}

		.select > * {
			display: flex;
			gap: 10px;
			align-items: center;
		}

		.select > :hover {
			background-color: var(--kanji-select-highlight, lightblue);
			cursor: pointer;
		}

		.select > .disabled {
			pointer-events: none;
			opacity: 66%;
		}

		.hint {
			font-size: 10px;
		}

		button {
			width: var(--kanji-select-button-width, 100px);
			cursor: pointer;
		}

		:host(.vertical) {
			height: 140px;
			flex-direction: row;
		}

		:host(.vertical) .select > * {
			writing-mode: vertical-rl;
		}

		:host(.vertical) button {
			width: unset;
		}

		:host(.vertical) button span {
			height: 100px;
			writing-mode: vertical-rl;
		}
	`;

	@internalProperty()
	private options: KanjiOption[] = [];

	@property({ attribute: false })
	kanji: string[] = [];

	@property({ attribute: false })
	preselected?: string[];

	private async updateOptions(notes: readonly NotesInfoResult[]) {
		if (await anki.isOnline()) {
			const offlineKanji = this.kanji.filter((kanji) => !notes.find(({ fields }) => fields['Kanji']?.value === kanji));

			this.options = this.kanji.map((kanji) => {
				this.preselected ??= this.kanji;

				const isOffline = offlineKanji.includes(kanji);
				const data = AddKanjiCards.data.get(kanji);

				const option: KanjiOption = {
					kanji,
					hint: isOffline ? (data ? nothing : html`no data`) : html`already in Anki`,
					data,
					disabled: !isOffline || !data,
					selected: data && isOffline && this.preselected.includes(kanji),
				};

				option.onClick = () => {
					option.selected = !option.selected;
					this.requestUpdate().catch(console.error);
				};

				return option;
			});
		} else {
			this.options = this.kanji.map((kanji) => {
				return {
					kanji,
					hint: html`Anki is offline`,
					disabled: true,
				};
			});
		}

		return this.requestUpdate();
	}

	private async addCards() {
		const instances = [...AddKanjiCards.instances];

		const selectedKanji = this.options.filter(({ selected }) => selected).map(({ kanji }) => kanji);

		for (const instance of instances) {
			instance.options = instance.options.map((option) => {
				return {
					...option,
					disabled: true,
					selected: false,
					hint: selectedKanji.includes(option.kanji) ? html`<inline-spinner></inline-spinner> adding to Anki` : nothing,
				};
			});
		}

		if (!DeckSelect.value) {
			throw new Error('unexepected error: no deck selected');
		}

		for (const kanji of selectedKanji) {
			const fetchedEntry = AddKanjiCards.data.get(kanji);

			if (!fetchedEntry) {
				console.warn(`no data for kanji: ${kanji}`);
				continue;
			}

			await anki.add(DeckSelect.value, kanji, fetchedEntry);
		}

		const notes = await anki.notes({ forceUpdate: true });

		for (const instance of instances) {
			await instance.updateOptions(notes);
		}
	}

	async connectedCallback(): Promise<unknown> {
		super.connectedCallback();

		AddKanjiCards.instances.add(this);

		this.options = this.kanji.map((kanji) => {
			return {
				kanji,
				hint: html`<inline-spinner></inline-spinner> connecting to Anki`,
				disabled: true,
			};
		});

		const ankiIsOnline = await anki.isOnline();

		const notes = ankiIsOnline ? await anki.notes() : [];

		if (ankiIsOnline) {
			const queries: Array<Promise<void>> = [];

			this.options = this.options.map((option) => {
				let query = AddKanjiCards.queries.get(option.kanji);

				if (!query) {
					query = fetch(`${KANJI_DB_BASE}${option.kanji}.json`)
						.then(async (response) => {
							if (response.status !== 200) {
								return;
							}

							return response.json() as Promise<KanjiEntry>;
						})
						.then((data) => {
							if (data) {
								AddKanjiCards.data.set(option.kanji, data);
							}
						})
						.catch();

					AddKanjiCards.queries.set(option.kanji, query);
				}

				queries.push(query);

				return {
					...option,
					hint: html`<inline-spinner></inline-spinner> fetching data`,
				};
			});

			await Promise.all(queries);
		}

		return this.updateOptions(notes);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		AddKanjiCards.instances.delete(this);
	}

	render(): TemplateResult {
		return html`
			<div class="select">
				${this.options.map(
					(option) => html`
						<div @click=${option.onClick} class=${classMap({ disabled: Boolean(option.disabled) })}>
							<span lang="ja">${option.selected ? '☑' : '☐'} ${option.kanji}</span>
							<span class="hint">${option.hint}</span>
						</div>
					`,
				)}
			</div>

			<button @click=${async () => this.addCards()} ?disabled=${this.options.every(({ selected }) => !selected)}>
				<span>Add selected kanji-cards</span>
			</button>
		`;
	}
}
