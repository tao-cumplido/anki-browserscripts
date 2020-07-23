import { trimLines } from './trim-lines';

export function createSvgElements(svg: string): SVGElement[];
export function createSvgElements<T extends SVGElement[]>(svg: string, ...types: { [P in keyof T]: new () => T[P] }): T;
export function createSvgElements<T extends SVGElement[]>(
   svg: string,
   ...types: { [P in keyof T]?: new () => T[P] }
): T {
   const template = document.createElement('template');
   template.innerHTML = `<svg>${trimLines(svg)}</svg>`;

   if (!template.content.firstChild) {
      throw new Error(`unexpected error`);
   }

   const result = [...template.content.firstChild.childNodes]
      .filter((node): node is Element => node instanceof Element)
      .map((element, index) => {
         const Type: new () => unknown = types[index] ?? SVGElement;

         if (!(element instanceof Type)) {
            throw new Error(`expected '${Type.name}', got '${element.constructor.name}'`);
         }

         return element;
      });

   return (result as unknown) as T;
}
