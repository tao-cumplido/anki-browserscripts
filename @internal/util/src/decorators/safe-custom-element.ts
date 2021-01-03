export function safeCustomElement(tagName: string) {
	return <T extends new () => HTMLElement>(elementConstructor: T): T => {
		if (typeof window.customElements.get(tagName) === 'undefined') {
			window.customElements.define(tagName, elementConstructor);
		}

		return elementConstructor;
	};
}
