export function createSvgElements<T extends SVGElement>(svg: string): NodeListOf<T> {
   const template = document.createElement('template');
   template.innerHTML = `<svg>${svg.trim()}</svg>`;

   if (!template.content.firstChild) {
      throw new Error(`unexpected error`);
   }

   return template.content.firstChild.childNodes as NodeListOf<T>;
}
