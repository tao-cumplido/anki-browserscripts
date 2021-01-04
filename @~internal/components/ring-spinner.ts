import type { TemplateResult } from 'lit-element';
import { css, html, LitElement } from 'lit-element';

import { safeCustomElement } from '@~internal/util';

// https://loading.io/css/
@safeCustomElement('ring-spinner')
export class SpinnerElement extends LitElement {
	static readonly styles = css`
		:host {
			position: relative;
			display: block;
			width: 40px;
			height: 40px;
		}

		.lds-ring-container {
			position: absolute;
			left: -50%;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
		}

		.lds-ring {
			transform: scale(0.5);
			display: inline-block;
			position: relative;
			width: 80px;
			height: 80px;
		}

		.lds-ring div {
			box-sizing: border-box;
			display: block;
			position: absolute;
			width: 64px;
			height: 64px;
			margin: 8px;
			animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
			border-width: 8px;
			border-style: solid;
			border-radius: 50%;
			border-color: var(--ring-spinner-color, #666) transparent transparent;
		}

		.lds-ring div:nth-child(1) {
			animation-delay: -0.45s;
		}

		.lds-ring div:nth-child(2) {
			animation-delay: -0.3s;
		}

		.lds-ring div:nth-child(3) {
			animation-delay: -0.15s;
		}

		@keyframes lds-ring {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}
	`;

	render(): TemplateResult {
		return html`
			<span class="lds-ring-container">
				<div class="lds-ring">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			</span>
		`;
	}
}
