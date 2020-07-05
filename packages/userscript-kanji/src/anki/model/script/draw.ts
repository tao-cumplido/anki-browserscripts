export interface Point {
   x: number;
   y: number;
}

export type Line = Point[];

export function setupDrawingContext(context: CanvasRenderingContext2D) {
   context.lineWidth = 10;
   context.lineCap = 'round';
   context.lineJoin = 'round';
}

export function drawLines(context: CanvasRenderingContext2D, lines: Line[]) {
   for (const line of lines) {
      context.beginPath();
      context.moveTo(line[0].x, line[0].y);
      for (const point of line) {
         context.lineTo(point.x, point.y);
      }
      context.stroke();
   }
}
