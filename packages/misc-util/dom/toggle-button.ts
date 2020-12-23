import type { TemplateResult } from 'lit-element';
import { html, property, LitElement } from 'lit-element';

import { safeCustomElement } from '../src';
import './icon-button';

export class ToggleEvent extends CustomEvent<{ state: boolean }> {
	constructor(state: boolean) {
		super('toggle', { detail: { state } });
	}
}

@safeCustomElement('toggle-button')
export class ToggleButton extends LitElement {
	@property()
	on = '';

	@property()
	off = '';

	@property({ attribute: false })
	state = true;

	private handleClick() {
		return () => {
			this.state = !this.state;
			this.dispatchEvent(new ToggleEvent(this.state));
		};
	}

	render(): TemplateResult {
		return html`<icon-button .path=${this.state ? this.on : this.off} @click=${this.handleClick()}></icon-button>`;
	}
}
