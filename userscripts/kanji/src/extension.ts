import './components/add-kanji-cards';
import './components/deck-select';

export interface Extension {
	run: () => Promise<void>;
}

export abstract class AbstractExtension implements Extension {
	abstract run(): Promise<void>;

	protected assertContainer(id: string): Element {
		const container = document.querySelector(`#${id}`) ?? document.createElement('div');
		container.id = id;
		return container;
	}
}
