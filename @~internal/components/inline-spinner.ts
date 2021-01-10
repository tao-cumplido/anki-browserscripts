import type { TemplateResult } from 'lit-element';
import { css, html, internalProperty, LitElement } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { safeCustomElement } from '@~internal/dom';

@safeCustomElement('inline-spinner')
export class InlineSpinner extends LitElement {
	private static readonly animation = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
		[0, 1, 0],
	];

	static readonly styles = css`
		:host {
			display: inline;
		}

		.weak {
			opacity: 50%;
		}
	`;

	@internalProperty()
	private state = 0;

	private interval?: number;

	connectedCallback(): void {
		super.connectedCallback();
		this.interval = window.setInterval(() => {
			this.state = (this.state + 1) % InlineSpinner.animation.length;
		}, 250);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		clearInterval(this.interval);
	}

	render(): TemplateResult {
		return html`${InlineSpinner.animation[this.state].map(
			(strong) => html`<span class=${classMap({ weak: !strong })}>•</span>`,
		)}`;
	}
}
