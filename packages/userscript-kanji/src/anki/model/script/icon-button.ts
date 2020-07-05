import { createHtmlElements } from '../../../util/create-html-elements';

export function iconButton(path: string, onClick?: (event: MouseEvent) => void) {
   const [button] = createHtmlElements<HTMLButtonElement>(`
      <button class="icon">
         <svg viewBox="0 0 24 24">
            <path d="${path}"></path>
         </svg>
      </button>
   `);

   button.onclick = (event) => {
      event.stopPropagation();
      onClick?.(event);
   };

   return button;
}

export function iconToggleButton(on: string, off: string, onClick?: (state: boolean, event: MouseEvent) => void) {
   let state = true;

   const button = iconButton(on);
   const path = button.querySelector('path');

   button.onclick = (event) => {
      event.stopPropagation();
      state = !state;
      path?.setAttribute('d', state ? on : off);
      onClick?.(state, event);
   };

   return button;
}
