import type { TemplateResult } from 'lit-element';
import { css, html, property, LitElement } from 'lit-element';

import { safeCustomElement } from '@~internal/util';

@safeCustomElement('icon-button')
export class IconButton extends LitElement {
	static readonly styles = css`
		button {
			line-height: 0;
			padding: 1px;
		}

		svg {
			width: 24px;
			height: 24px;
		}
	`;

	@property()
	path = '';

	render(): TemplateResult {
		return html`
			<button>
				<svg viewBox="0 0 24 24">
					<path d=${this.path}></path>
				</svg>
			</button>
		`;
	}
}
