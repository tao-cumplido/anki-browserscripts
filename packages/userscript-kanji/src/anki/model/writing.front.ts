import mdiClose from '@mdi/svg/svg/close.svg';
import mdiGridOff from '@mdi/svg/svg/grid-off.svg';
import mdiGrid from '@mdi/svg/svg/grid.svg';
import mdiPencilOff from '@mdi/svg/svg/pencil-off.svg';
import mdiPencil from '@mdi/svg/svg/pencil.svg';
import mdiUndo from '@mdi/svg/svg/undo.svg';
import 'anki-persistence';

import { createCanvas } from './script/create-canvas';
import { drawLines, setupDrawingContext, Line, Point } from './script/draw';
import { iconButton, iconToggleButton } from './script/icon-button';
import { parseData } from './script/parse-data';

const data = parseData(`{{Data}}`);

const meanings = document.querySelector('#meanings');

if (!meanings) {
   throw new Error(`unexpected missing #meanings element`);
}

meanings.textContent = data.meanings.join('\u2002・\u2002');

const canvas = document.querySelector('canvas');
const context = canvas?.getContext('2d');

if (!canvas || !context) {
   throw new Error(`unexpected missing canvas element`);
}

const svg = createCanvas();

canvas.parentElement?.prepend(svg);

const rect = canvas.getBoundingClientRect();

const scalingFactor = canvas.width / rect.width;

function normalizePoint({ pageX: x, pageY: y }: MouseEvent | Touch): Point {
   return {
      x: (x - rect.left) * scalingFactor,
      y: (y - rect.top) * scalingFactor,
   };
}

let mouseDown = false;

let image: Line[] = [];
let currentLine: Line = [];

setupDrawingContext(context);

function drawDot(point: Point) {
   currentLine = [point];
   context?.beginPath();
   context?.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
   context?.fill();
   context?.beginPath();
   context?.moveTo(point.x, point.y);
}

function drawLine(point: Point) {
   currentLine.push(point);
   context?.lineTo(point.x, point.y);
   context?.stroke();
}

function persist() {
   if (Persistence.isAvailable()) {
      Persistence.setItem(image);
   }
}

window.addEventListener('mousedown', () => {
   mouseDown = true;
});

window.addEventListener('mouseup', () => {
   mouseDown = false;
});

window.addEventListener('click', () => {
   if (currentLine.length) {
      image.push(currentLine);
   }
   persist();
});

canvas.addEventListener('mousedown', (event) => {
   drawDot(normalizePoint(event));
});

canvas.addEventListener('mousemove', (event) => {
   if (mouseDown) {
      drawLine(normalizePoint(event));
   }
});

canvas.addEventListener('touchstart', (event) => {
   event.preventDefault();
   drawDot(normalizePoint(event.changedTouches[0]));
});

canvas.addEventListener('touchmove', (event) => {
   event.preventDefault();
   drawLine(normalizePoint(event.changedTouches[0]));
});

canvas.addEventListener('touchend', () => {
   if (currentLine.length) {
      image.push(currentLine);
   }
   persist();
});

function clear() {
   context?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
}

const grid = document.querySelector<SVGElement>('g.grid');

if (!grid) {
   throw new Error(`unexpected error: missing .grid element`);
}

document.querySelector('.side.left')?.append(
   iconToggleButton(mdiGrid, mdiGridOff, (state) => {
      grid.style.visibility = state ? 'visible' : 'hidden';
   }),
);

document.querySelector('.side.left')?.append(
   iconToggleButton(mdiPencil, mdiPencilOff, (state) => {
      canvas.style.visibility = state ? 'visible' : 'hidden';
   }),
);

document.querySelector('.side.left')?.append(
   iconButton(mdiUndo, () => {
      image.pop();
      currentLine = [];
      persist();
      clear();
      drawLines(context, image);
   }),
);

document.querySelector('.side.left')?.append(
   iconButton(mdiClose, () => {
      clear();
      image = [];
      currentLine = [];
      persist();
   }),
);
