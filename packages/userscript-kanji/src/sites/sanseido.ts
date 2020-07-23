import { createHtmlElements } from 'script-util';

import anki from '../anki';
import { AbstractExtension } from '../extension';
import extensionStyle from '../extension.scss';
import spinner from '../spinner.html';
import sanseidoStyle from './sanseido.scss';

export class Sanseido extends AbstractExtension {
   private readonly dictionaryArea: HTMLDivElement;

   private readonly deckSelect = createHtmlElements(
      `
      <select id="userscript-kanji-deck-select" disabled>
         <option selected>
            -- checking Anki
         </option>
      </select>
   `,
      HTMLSelectElement,
   )[0];

   private readonly kanjiSelect = document.createElement('select');
   private readonly addCardsButton = document.createElement('button');

   private readonly kanji = document.querySelector('#word p.text-ll')?.textContent?.match(/\p{sc=Han}/gu) ?? [];

   constructor() {
      super();

      const dictionaryArea = document.querySelector<HTMLDivElement>('#dictionaryArea');

      if (!dictionaryArea) {
         throw new Error(`element '#dictionaryArea' not found`);
      }

      this.dictionaryArea = dictionaryArea;
   }

   private setupConfig() {
      const containerId = 'userscript-config';

      let configContainer = document.querySelector(`#${containerId}`);

      if (!configContainer) {
         [configContainer] = createHtmlElements(`<div id="${containerId}"></div>`);
         this.dictionaryArea.parentElement?.insertBefore(configContainer, this.dictionaryArea);
      }

      const [configElement] = createHtmlElements(`<div id="userscript-kanji-config"></div>`);

      configContainer.append(configElement);

      this.deckSelect.onchange = () => {
         localStorage.setItem('kanji:deck', this.deckSelect.value);
      };

      configElement.append(...createHtmlElements(`<label>Deck to add kanji-cards</label>`));
      configElement.append(this.deckSelect);
   }

   private setupAction() {
      const containerId = 'userscript-actions';

      let actionContainer = document.querySelector<HTMLDivElement>(`#${containerId}`);

      if (!actionContainer) {
         actionContainer = document.createElement('div');
         actionContainer.id = containerId;
         this.dictionaryArea.querySelector('#wordDetail')?.prepend(actionContainer);
      }

      const actionsElement = document.createElement('div');
      actionsElement.id = 'userscript-kanji-actions';

      actionContainer.append(actionsElement);

      this.kanjiSelect.classList.add('kanji-select');
      this.kanjiSelect.multiple = true;
      this.kanjiSelect.size = 3;

      for (const kanji of this.kanji) {
         const option = document.createElement('option');
         option.disabled = true;
         option.textContent = `${kanji} -- checking Anki`;
         option.value = kanji;
         option.onmousedown = (event) => {
            event.preventDefault();
            option.selected = !option.selected;
            this.addCardsButton.disabled = [...this.kanjiSelect.options].every(({ selected }) => !selected);
         };

         this.kanjiSelect.options.add(option);
      }

      actionsElement.append(this.kanjiSelect);

      this.addCardsButton.id = 'userscript-kanji-add-cards';
      this.addCardsButton.className = 'anki';
      this.addCardsButton.disabled = true;
      this.addCardsButton.textContent = 'Add kanji-cards';

      this.addCardsButton.onclick = async () => {
         this.addCardsButton.disabled = true;
         this.addCardsButton.innerHTML = spinner;

         const selectedKanji = [...this.kanjiSelect.options]
            .filter(({ selected }) => selected)
            .map(({ value }) => value);

         const data = await this.parseQuery
            .containedIn('kanji', selectedKanji)
            .find()
            .then((results) => results.map(({ attributes }) => attributes));

         for (const kanji of selectedKanji) {
            const fetchedEntry = data.find((entry) => entry.kanji === kanji);

            if (!fetchedEntry) {
               console.warn(`no data for kanji: ${kanji}`);
               continue;
            }

            await anki.add(this.deckSelect.value, kanji, fetchedEntry);
         }

         this.addCardsButton.innerHTML = 'Add kanji-cards';

         this.updateActionElements().catch(console.error);
      };

      const shadowStyle = document.createElement('style');
      shadowStyle.textContent = `${extensionStyle}${sanseidoStyle}`;

      const shadowContainer = document.createElement('div');

      actionsElement.append(shadowContainer);

      const shadow = shadowContainer.attachShadow({ mode: 'open' });

      shadow.append(shadowStyle);
      shadow.append(this.addCardsButton);
   }

   private async updateActionElements() {
      const onlineNotes = await anki.notes();

      const offlineKanji = this.kanji.filter(
         (kanji) => !onlineNotes.find(({ fields }) => fields['Kanji'].value === kanji),
      );

      for (const option of this.kanjiSelect.options) {
         if (offlineKanji.includes(option.value)) {
            this.addCardsButton.disabled = false;
            option.disabled = false;
            option.selected = true;
            option.textContent = option.value;
         } else {
            option.disabled = true;
            option.selected = false;
            option.textContent = `${option.value} -- already in Anki`;
         }
      }
   }

   async run() {
      GM_addStyle(sanseidoStyle);

      this.setupConfig();
      this.setupAction();

      if (await anki.isOnline()) {
         const lastSelected = localStorage.getItem('kanji:deck');

         this.deckSelect.options.remove(0);

         for (const deck of await anki.decks()) {
            const option = document.createElement('option');
            option.textContent = deck;
            option.selected = deck === lastSelected;
            this.deckSelect.options.add(option);
         }

         this.deckSelect.disabled = false;

         await this.updateActionElements();
      } else {
         this.deckSelect.options[0].textContent = '-- Anki is offline';

         for (const option of this.kanjiSelect.options) {
            option.textContent = `${option.value} -- Anki is offline`;
         }
      }
   }
}
