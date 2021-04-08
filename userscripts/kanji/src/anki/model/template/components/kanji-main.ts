import type { TemplateResult } from 'lit-html';
import 'anki-persistence';
import { html, property, query, queryAll, svg, unsafeCSS, LitElement } from 'lit-element';
import { nothing } from 'lit-html';

import mdiClose from '@mdi/svg/svg/close.svg';
import mdiEyeOff from '@mdi/svg/svg/eye-off.svg';
import mdiEye from '@mdi/svg/svg/eye.svg';
import mdiGridOff from '@mdi/svg/svg/grid-off.svg';
import mdiGrid from '@mdi/svg/svg/grid.svg';
import mdiLayersOff from '@mdi/svg/svg/layers-off.svg';
import mdiLayers from '@mdi/svg/svg/layers.svg';
import mdiPencilOff from '@mdi/svg/svg/pencil-off.svg';
import mdiPencil from '@mdi/svg/svg/pencil.svg';
import mdiPlay from '@mdi/svg/svg/play.svg';
import mdiUndo from '@mdi/svg/svg/undo.svg';

import type { ToggleEvent } from '@~internal/components/toggle-button';
import '@~internal/components/toggle-button';
import { safeCustomElement } from '@~internal/dom';
import { assertReturn } from '@~internal/util';

import styles from './kanji-main.scss';

declare module '@tswt/core' {
	interface AutonomousCustomElementMap {
		'kanji-main': KanjiMain;
	}
}

export interface Point {
	x: number;
	y: number;
}

@safeCustomElement('kanji-main')
export class KanjiMain extends LitElement {
	static readonly styles = unsafeCSS(styles);

	private mouseDown = false;
	private currentLine: Point[] = [];
	private readonly image: Point[][] = [];

	private drawDot?: (point: Point) => void;
	private drawLine?: (point: Point) => void;

	@query('canvas')
	canvas?: HTMLCanvasElement;

	@queryAll('.strokes path')
	strokeElements!: NodeList<SVGPathElement>;

	@property({ attribute: false })
	kanji = '';

	@property({ attribute: false })
	strokes: string[] = [];

	@property({ type: Boolean })
	drawing = false;

	@property({ type: Boolean })
	showStrokesToggle = false;

	@property({ type: Boolean })
	showGuidesToggle = false;

	@property({ type: Boolean })
	showPlayAnimationButton = false;

	@property({ type: Boolean })
	showGridToggle = false;

	@property({ type: Boolean })
	showDrawingToggle = false;

	@property({ type: Boolean })
	showUndoButton = false;

	@property({ type: Boolean })
	showClearButton = false;

	drawImage?: (lines: Point[][]) => void;
	setDrawingColor?: (color: string, opacity?: string) => void;

	private normalizePoint: (source: MouseEvent | Touch) => Point = () => {
		return { x: 0, y: 0 };
	};

	private readonly globalMouseDown = () => (this.mouseDown = true);
	private readonly globalMouseUp = () => (this.mouseDown = false);

	private readonly localMouseDown = (event: MouseEvent) => this.drawDot?.(this.normalizePoint(event));
	private readonly localMouseMove = (event: MouseEvent) => {
		if (this.mouseDown) {
			this.drawLine?.(this.normalizePoint(event));
		}
	};

	private readonly localTouchStart = (event: TouchEvent) => {
		event.preventDefault();
		this.drawDot?.(this.normalizePoint(event.changedTouches[0]));
	};

	private readonly localTouchMove = (event: TouchEvent) => {
		event.preventDefault();
		this.drawLine?.(this.normalizePoint(event.changedTouches[0]));
	};

	private readonly persistLine = () => {
		if (this.currentLine.length) {
			this.image.push(this.currentLine);
		}

		this.persistDrawing();
	};

	private persistDrawing() {
		if (Persistence.isAvailable()) {
			Persistence.setItem(this.kanji, this.image);
		}
	}

	private setupDrawing(canvas: HTMLCanvasElement) {
		const context = assertReturn(canvas.getContext('2d'));

		context.lineWidth = 10;
		context.lineCap = 'round';
		context.lineJoin = 'round';

		const rect = canvas.getBoundingClientRect();

		const scalingFactor = canvas.width / rect.width;

		this.normalizePoint = ({ pageX: x, pageY: y }) => {
			return {
				x: (x - rect.left) * scalingFactor,
				y: (y - rect.top) * scalingFactor,
			};
		};

		this.drawDot = (point) => {
			this.currentLine = [point];
			context.beginPath();
			context.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
			context.fill();
			context.beginPath();
			context.moveTo(point.x, point.y);
		};

		this.drawLine = (point) => {
			this.currentLine.push(point);
			context.lineTo(point.x, point.y);
			context.stroke();
		};

		this.setDrawingColor = (color: string, opacity = '1') => {
			context.strokeStyle = color;
			context.fillStyle = color;
			context.canvas.style.opacity = opacity;
		};

		this.drawImage = (image) => {
			for (const line of image) {
				context.beginPath();
				context.moveTo(line[0].x, line[0].y);
				for (const { x, y } of line) {
					context.lineTo(x, y);
				}
				context.stroke();
			}
		};
	}

	private clearDrawing() {
		if (this.canvas) {
			this.canvas.getContext('2d')?.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}

	private renderStrokes() {
		const strokePaths = this.strokes.map((stroke) => svg`<path d=${stroke}></path>`);

		return svg`
         <g class="strokes-group">
            <g class="guides">${strokePaths}</g>
            <g class="strokes">${strokePaths}</g>
         </g>
      `;
	}

	private renderDrawingArea() {
		return html`
			<canvas
				width="500"
				height="500"
				@mousedown=${this.localMouseDown}
				@mousemove=${this.localMouseMove}
				@touchstart=${this.localTouchStart}
				@touchmove=${this.localTouchMove}
				@touchend=${this.persistLine}
			></canvas>
		`;
	}

	private renderStrokesToggle() {
		return html`
			<toggle-button
				on=${mdiEye}
				off=${mdiEyeOff}
				@toggle=${({ detail: { state } }: ToggleEvent) => {
					const strokes = assertReturn(this.renderRoot.querySelector<SVGElement>('g.strokes-group'));
					strokes.style.opacity = state ? '1' : '0';
				}}
			></toggle-button>
		`;
	}

	private renderGuidesToggle() {
		return html`
			<toggle-button
				on=${mdiLayers}
				off=${mdiLayersOff}
				@toggle=${({ detail: { state } }: ToggleEvent) => {
					const guides = assertReturn(this.renderRoot.querySelector<SVGElement>('g.guides'));
					guides.style.opacity = state ? '1' : '0';
				}}
			></toggle-button>
		`;
	}

	private renderPlayAnimationButton() {
		return html`<icon-button @click=${() => this.playAnimation()} .path=${mdiPlay}></icon-button>`;
	}

	private renderGridToggle() {
		return html`
			<toggle-button
				on=${mdiGrid}
				off=${mdiGridOff}
				@toggle=${({ detail: { state } }: ToggleEvent) => {
					const grid = assertReturn(this.renderRoot.querySelector<SVGElement>('g.grid'));
					grid.style.visibility = state ? 'visible' : 'hidden';
				}}
			></toggle-button>
		`;
	}

	private renderDrawingToggle() {
		return html`
			<toggle-button
				on=${mdiPencil}
				off=${mdiPencilOff}
				@toggle=${({ detail: { state } }: ToggleEvent) => {
					if (this.canvas) {
						this.canvas.style.visibility = state ? 'visible' : 'hidden';
					}
				}}
			></toggle-button>
		`;
	}

	private renderUndoButton() {
		return html`
			<icon-button
				.path=${mdiUndo}
				@click=${() => {
					this.image.pop();
					this.currentLine = [];
					this.persistDrawing();
					this.clearDrawing();
					this.drawImage?.(this.image);
				}}
			></icon-button>
		`;
	}

	private renderClearButton() {
		return html`
			<icon-button
				.path=${mdiClose}
				@click=${() => {
					this.clearDrawing();
					this.image.length = 0;
					this.currentLine = [];
					this.persistDrawing();
				}}
			></icon-button>
		`;
	}

	private renderCanvas() {
		return html`
			<div class="side left">
				<!-- prettier-ignore -->
				${this.showGridToggle ? this.renderGridToggle() : nothing}
				${this.showDrawingToggle ? this.renderDrawingToggle() : nothing}
				${this.showUndoButton ? this.renderUndoButton() : nothing}
				${this.showClearButton ? this.renderClearButton() : nothing}
			</div>
			<div class="canvas">
				<svg viewBox="0 0 109 109">
					<g class="grid">
						<line x1="0" y1="0" x2="109" y2="109"></line>
						<line x1="0" y1="109" x2="109" y2="0"></line>
						<line x1="0" y1="54.5" x2="109" y2="54.5"></line>
						<line x1="54.5" y1="0" x2="54.5" y2="109"></line>
					</g>
					${this.strokes.length ? this.renderStrokes() : nothing}
				</svg>
				${this.drawing ? this.renderDrawingArea() : nothing}
			</div>
			<div class="side right">
				<!-- prettier-ignore -->
				${this.showStrokesToggle ? this.renderStrokesToggle() : nothing}
				${this.showGuidesToggle ? this.renderGuidesToggle() : nothing}
				${this.showPlayAnimationButton ? this.renderPlayAnimationButton() : nothing}
			</div>
		`;
	}

	playAnimation(): void {
		// https://jakearchibald.com/2013/animated-line-drawing-svg/
		requestAnimationFrame(() => {
			[...this.strokeElements].reduce((delay, stroke) => {
				const length = stroke.getTotalLength();
				const duration = length * 0.02;

				stroke.style.transition = 'none';
				stroke.style.strokeDasharray = `${length}`;
				stroke.style.strokeDashoffset = `${length}`;
				stroke.style.opacity = '0';

				requestAnimationFrame(() => {
					stroke.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(0.33,0,0.25,1) ${delay}s, opacity 0s linear ${delay}s`;
					stroke.style.strokeDashoffset = '0';
					stroke.style.opacity = '1';
				});

				return delay + duration;
			}, 0);
		});
	}

	firstUpdated(): void {
		requestAnimationFrame(() => {
			if (this.canvas) {
				this.setupDrawing(this.canvas);
			}
		});
	}

	updated(properties: Map<'drawing', unknown>): void {
		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		if (this.canvas && properties.get('drawing')) {
			this.setupDrawing(this.canvas);
		}
	}

	render(): TemplateResult {
		if (this.strokes.length || this.drawing) {
			return this.renderCanvas();
		}

		return html`<span class="no-strokes">${this.kanji}</span>`;
	}

	connectedCallback(): void {
		super.connectedCallback();
		addEventListener('mousedown', this.globalMouseDown);
		addEventListener('mouseup', this.globalMouseUp);
		addEventListener('click', this.persistLine);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		removeEventListener('mousedown', this.globalMouseDown);
		removeEventListener('mouseup', this.globalMouseUp);
		removeEventListener('click', this.persistLine);
	}
}
