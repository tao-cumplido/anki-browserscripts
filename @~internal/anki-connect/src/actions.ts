/* eslint-disable @typescript-eslint/naming-convention */

type ConstRecord<T> = Readonly<Record<string, T>>;
type SafeRecord<T> = Partial<ConstRecord<T>>;

export interface CardsRequest {
	readonly cards: readonly number[];
}

export interface DeckRequest {
	readonly deck: string;
}

export interface ModelRequest {
	readonly modelName: string;
}

export interface ModelTemplate {
	readonly Front: string;
	readonly Back: string;
}

export interface CreateModelTemplate extends ModelTemplate {
	readonly Name: string;
}

export interface CreateModelRequest extends ModelRequest {
	readonly inOrderFields: readonly string[];
	readonly css?: string;
	readonly cardTemplates: readonly CreateModelTemplate[];
}

export interface AddNoteRequest {
	readonly note: {
		readonly deckName: string;
		readonly modelName: string;
		readonly fields: Readonly<Record<string, string>>;
		readonly tags: readonly string[];
		readonly options?: {
			readonly allowDuplicate: boolean;
		};
		readonly audio?: {
			readonly url: string;
			readonly filename: string;
			readonly skipHash?: string;
			readonly fields?: readonly string[];
		};
	};
}

export interface UpdateNoteRequest {
	readonly note: Partial<AddNoteRequest['note']> & { id: number };
}

export interface QueryRequest {
	readonly query: string;
}

export interface NotesInfoRequest {
	readonly notes: readonly number[];
}

export interface NoteField {
	readonly value: string;
	readonly order: number;
}

export interface NotesInfoResult {
	readonly noteId: number;
	readonly modelName: string;
	readonly tags: readonly string[];
	readonly fields: SafeRecord<NoteField>;
}

// https://foosoft.net/projects/anki-connect/#application-interface-for-developers
export interface Actions {
	// miscellaneous actions
	version: {
		result: 6;
	};
	sync: {
		result: null;
	};

	// deck actions
	deckNames: {
		result: readonly string[];
	};
	deckNamesAndIds: {
		result: SafeRecord<number>;
	};
	getDecks: {
		request: CardsRequest;
		result: SafeRecord<number[]>;
	};
	createDeck: {
		request: DeckRequest;
		result: number;
	};
	deleteDecks: {
		request: {
			decks: string[];
			cardsToo?: boolean;
		};
		result: null;
	};

	// model actions
	modelNames: {
		result: readonly string[];
	};
	modelNamesAndIds: {
		result: SafeRecord<number>;
	};
	modelFieldNames: {
		request: ModelRequest;
		result: string[];
	};
	modelFielsOnTemplates: {
		request: ModelRequest;
		result: SafeRecord<ReadonlyArray<readonly string[]>>;
	};
	createModel: {
		request: CreateModelRequest;
		result: SafeRecord<unknown>;
	};
	updateModelTemplates: {
		request: {
			model: {
				readonly name: string;
				readonly templates: ConstRecord<ModelTemplate>;
			};
		};
		result: null;
	};
	updateModelStyling: {
		request: {
			model: {
				readonly name: string;
				readonly css: string;
			};
		};
		result: null;
	};

	// note actions
	addNote: {
		request: AddNoteRequest;
		result: number;
	};
	findNotes: {
		request: QueryRequest;
		result: readonly number[];
	};
	notesInfo: {
		request: NotesInfoRequest;
		result: readonly NotesInfoResult[];
	};
	updateNoteFields: {
		request: UpdateNoteRequest;
		result: null;
	};
}
