export function createDom<T extends Element>(html: string): HTMLCollectionOf<T> {
   const template = document.createElement('template');
   template.innerHTML = html.trim();
   return template.content.children as HTMLCollectionOf<T>;
}
