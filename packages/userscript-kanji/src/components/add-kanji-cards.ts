import type { NotesInfoResult } from 'anki-connect';
import type { KanjiEntry } from 'kanji-db';
import type { TemplateResult } from 'lit-element';
import type { Object as Type } from 'parse';
import { css, customElement, html, internalProperty, property, LitElement } from 'lit-element';
import { nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map';
import 'misc-util/dom/inline-spinner';
import { Query } from 'parse';

import anki from '../anki';
import { DeckSelect } from './deck-select';

type ParseEntry = Type<KanjiEntry & { createdAt: string; updatedAt: string }>;

interface KanjiOption {
	kanji: string;
	hint: TemplateResult | typeof nothing;
	disabled?: boolean;
	selected?: boolean;
	onClick?: () => void;
}

@customElement('kanji-select')
export class AddKanjiCards extends LitElement {
	private static readonly instances = new Set<AddKanjiCards>();

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

	private readonly parseQuery = new Query<ParseEntry>('Kanji');

	@property({ attribute: false })
	kanji: string[] = [];

	@property({ attribute: false })
	preselected?: string[];

	private async updateOptions(notes: readonly NotesInfoResult[]) {
		if (await anki.isOnline()) {
			const offlineKanji = this.kanji.filter((字) => !notes.find(({ fields }) => fields['Kanji']?.value === 字));

			this.options = this.kanji.map((字) => {
				this.preselected ??= this.kanji;

				const isOffline = offlineKanji.includes(字);

				const option: KanjiOption = {
					kanji: 字,
					hint: isOffline ? nothing : html`already in Anki`,
					disabled: !isOffline,
					selected: isOffline && this.preselected.includes(字),
				};

				option.onClick = () => {
					option.selected = !option.selected;
					this.requestUpdate().catch(console.error);
				};

				return option;
			});
		} else {
			this.options = this.kanji.map((字) => {
				return {
					kanji: 字,
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
					hint: selectedKanji.includes(option.kanji) ? html`<inline-spinner></inline-spinner>adding to Anki` : nothing,
				};
			});
		}

		const parseResult = await this.parseQuery.containedIn('kanji', selectedKanji).find();
		const data = parseResult.map(({ attributes }) => {
			const { createdAt, updatedAt, ...entry } = attributes;
			return entry;
		});

		if (!DeckSelect.value) {
			throw new Error('unexepected error: no deck selected');
		}

		for (const kanji of selectedKanji) {
			const fetchedEntry = data.find((entry) => entry.kanji === kanji);

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

		this.options = this.kanji.map((字) => {
			return {
				kanji: 字,
				hint: html`<inline-spinner></inline-spinner>connecting to Anki`,
				disabled: true,
			};
		});

		const notes = (await anki.isOnline()) ? await anki.notes() : [];

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
