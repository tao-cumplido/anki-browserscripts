import { request, ModelTemplate } from 'anki-connect';
import jsesc from 'jsesc';

import { KanjiEntry } from '../kanji';
import { model, modelName, modelVersion } from './model';

async function checkModel() {
   const availableModels = await request('modelNames');

   if (availableModels.includes(model.modelName)) {
      if (!PRODUCTION) {
         await request('updateModelStyling', {
            model: {
               name: model.modelName,
               css: model.css,
            },
         });

         await request('updateModelTemplates', {
            model: {
               name: model.modelName,
               templates: model.cardTemplates.reduce<Record<string, ModelTemplate>>((result, template) => {
                  result[template.Name] = template;
                  return result;
               }, {}),
            },
         });
      }

      return;
   }

   return request('createModel', model);
}

let isOnline = false;

export default {
   isOnline: async () => {
      if (isOnline) {
         return true;
      }

      try {
         await request('version');
         isOnline = true;
      } catch {}

      await checkModel();

      return isOnline;
   },
   decks: () => request('deckNames'),
   add: (deck: string, kanji: string, data: KanjiEntry) => {
      return request('addNote', {
         note: {
            deckName: deck,
            modelName: model.modelName,
            fields: {
               Kanji: kanji,
               Data: jsesc(JSON.stringify(data)),
            },
            tags: [],
         },
      });
   },
   notes: async () => {
      return request('notesInfo', {
         notes: await request('findNotes', {
            query: [...Array(modelVersion + 1).keys()].map((version) => `note:${modelName(version)}`).join(' or '),
         }),
      });
   },
};
