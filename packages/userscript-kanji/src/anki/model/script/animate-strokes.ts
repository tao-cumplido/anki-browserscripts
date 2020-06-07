export function animateStrokes(strokes: NodeListOf<SVGPathElement>) {
   let delay = 0;

   for (const stroke of strokes) {
      const length = stroke.getTotalLength();
      const duration = length * 0.02;

      stroke.style.transition = 'none';
      stroke.style.strokeDasharray = `${length}`;
      stroke.style.strokeDashoffset = `${length}`;
      stroke.style.opacity = '0';

      stroke.getBoundingClientRect();

      stroke.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(0.33,0,0.25,1) ${delay}s, opacity 0s linear ${delay}s`;
      stroke.style.strokeDashoffset = '0';
      stroke.style.opacity = '1';

      delay += duration;
   }
}
