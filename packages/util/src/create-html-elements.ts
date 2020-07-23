import { trimLines } from './trim-lines';

export function createHtmlElements(html: string): Element[];
export function createHtmlElements<T extends Element[]>(html: string, ...types: { [P in keyof T]: new () => T[P] }): T;
export function createHtmlElements<T extends Element[]>(
   html: string,
   ...types: { [P in keyof T]?: new () => T[P] }
): T {
   const template = document.createElement('template');
   template.innerHTML = trimLines(html);

   const result = [...template.content.children].map((element, index) => {
      const Type: new () => unknown = types[index] ?? Element;

      if (!(element instanceof Type)) {
         throw new Error(`expected '${Type.name}', got '${element.constructor.name}'`);
      }

      return element;
   });

   return (result as unknown) as T;
}
