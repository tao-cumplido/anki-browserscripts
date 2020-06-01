import anki from '../anki';
import data from '../data.json';
import { AbstractExtension } from '../extension';
import extensionStyle from '../extension.scss';
import spinner from '../spinner.html';
import sanseidoStyle from './sanseido.scss';

export class Sanseido extends AbstractExtension {
   private readonly dictionaryArea: HTMLDivElement;

   private readonly deckSelect = document.createElement('select');
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

      let configContainer = document.querySelector<HTMLDivElement>(`#${containerId}`);

      if (!configContainer) {
         configContainer = document.createElement('div');
         configContainer.id = containerId;
         this.dictionaryArea.parentElement?.insertBefore(configContainer, this.dictionaryArea);
      }

      const configElement = document.createElement('div');
      configElement.id = 'userscript-kanji-config';

      configContainer.append(configElement);

      this.deckSelect.id = 'userscript-kanji-deck-select';
      this.deckSelect.disabled = true;
      this.deckSelect.options.add(document.createElement('option'));
      this.deckSelect.options[0].selected = true;
      this.deckSelect.options[0].textContent = '-- checking Anki';

      this.deckSelect.onchange = () => {
         localStorage.setItem('kanji:deck', this.deckSelect.value);
      };

      const deckSelectLabel = document.createElement('label');
      deckSelectLabel.textContent = 'Deck to add kanji-cards';

      configElement.append(deckSelectLabel);
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

         for (const option of this.kanjiSelect.options) {
            if (!option.selected) {
               continue;
            }

            const kanji = option.value;

            const entry = data[kanji];

            if (!entry) {
               console.warn(`no data for kanji: ${kanji}`);
               continue;
            }

            await anki.add(this.deckSelect.value, kanji, entry);
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
