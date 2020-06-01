import recognitionBack from './recognition.back.html';
import recognitionFront from './recognition.front.html';
import style from './style.scss';
import writingBack from './writing.back.html';
import writingFront from './writing.front.html';

export const modelVersion = PRODUCTION ? 1 : 0;

export function modelName(version: number) {
   return `jp:userscript:kanji:v${version}`;
}

export const model = {
   modelName: modelName(modelVersion),
   inOrderFields: ['Kanji', 'Data'],
   css: style,
   cardTemplates: [
      {
         Name: 'Recognition',
         Front: recognitionFront,
         Back: recognitionBack,
      },
      {
         Name: 'Writing',
         Front: writingFront,
         Back: writingBack,
      },
   ],
};
