import type { TemplateResult } from 'lit-element';
import { css, html, property, LitElement } from 'lit-element';
import { until } from 'lit-html/directives/until';

import { safeCustomElement } from '@~internal/util';

import './ring-spinner';

@safeCustomElement('async-button')
export class AsyncButton extends LitElement {
	static readonly styles = css`
		button {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			min-height: 52px;
			padding-left: 8px;
			padding-right: 8px;
		}

		button:not(:disabled):hover {
			cursor: pointer;
		}
	`;

	@property({ attribute: false })
	content?: string | Promise<string>;

	@property({ attribute: false })
	disabled = false;

	render(): TemplateResult {
		return html`<button ?disabled=${this.disabled}>${until(this.content, html`<ring-spinner></ring-spinner>`)}</button>`;
	}
}
