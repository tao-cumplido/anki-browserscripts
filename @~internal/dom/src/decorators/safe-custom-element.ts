export function safeCustomElement(tagName: string) {
	return <T extends new () => HTMLElement>(elementConstructor: T): T => {
		if (typeof customElements.get(tagName) === 'undefined') {
			customElements.define(tagName, elementConstructor);
		}

		return elementConstructor;
	};
}
