import jsesc from 'jsesc';

import type { ModelTemplate, NotesInfoResult } from '@internal/anki-connect';
import { request } from '@internal/anki-connect';

import type { KanjiEntry } from '../../types';
import { dbRevision, model, modelName, modelVersion } from './model';

async function checkModel() {
	const availableModels = await request('modelNames');

	if (availableModels.includes(model.modelName)) {
		if (!PRODUCTION) {
			const update = async () => {
				/* eslint-disable no-console */

				console.log(`updating model: '${model.modelName}'`);

				await request('updateModelStyling', {
					model: {
						name: model.modelName,
						css: model.css,
					},
				});

				console.log(`updated stylings for '${model.modelName}'`);

				await request('updateModelTemplates', {
					model: {
						name: model.modelName,
						templates: model.cardTemplates.reduce<Record<string, ModelTemplate>>((result, template) => {
							result[template.Name] = template;
							return result;
						}, {}),
					},
				});

				console.log(`updated templates for '${model.modelName}'`);

				/* eslint-enable no-console */
			};

			update().catch(console.error);
		}

		return;
	}

	await request('createModel', model);
}

function escapeEntry(entry: KanjiEntry) {
	return jsesc(JSON.stringify(entry), { quotes: 'double', minimal: true });
}

let isOnlineCache: Promise<boolean> | null = null;
let notesCache: Promise<readonly NotesInfoResult[]> | null = null;

export default {
	isOnline: async (): Promise<boolean> => {
		isOnlineCache ??= request('version')
			.then(async () => {
				await checkModel();
				return true;
			})
			.catch(() => false);

		return isOnlineCache;
	},
	decks: async (): Promise<readonly string[]> => request('deckNames'),
	add: async (deck: string, kanji: string, data: KanjiEntry): Promise<number> =>
		request('addNote', {
			note: {
				deckName: deck,
				modelName: model.modelName,
				fields: {
					/* eslint-disable @typescript-eslint/naming-convention */
					Kanji: kanji,
					DB: `${dbRevision}`,
					Data: escapeEntry(data),
					/* eslint-enable @typescript-eslint/naming-convention */
				},
				tags: [],
			},
		}),
	async notes({ forceUpdate = false } = {}): Promise<readonly NotesInfoResult[]> {
		if (forceUpdate || !notesCache) {
			notesCache = request('findNotes', {
				query: [...Array(modelVersion).keys()].map((index) => `note:${modelName(index + 1)}`).join(' or '),
			}).then(async (idList) => request('notesInfo', { notes: [...new Set(idList)] }));
		}

		return notesCache;
	},
	async oldNotes(): Promise<readonly NotesInfoResult[]> {
		const notes = await this.notes();
		return notes.filter(({ fields }) => parseInt(fields['DB']?.value ?? '0') < dbRevision);
	},
	async update(id: number, data: KanjiEntry): Promise<void> {
		await request('updateNoteFields', {
			note: {
				id,
				modelName: model.modelName,
				fields: {
					/* eslint-disable @typescript-eslint/naming-convention */
					DB: `${dbRevision}`,
					Data: escapeEntry(data),
					/* eslint-enable @typescript-eslint/naming-convention */
				},
			},
		});
	},
};
