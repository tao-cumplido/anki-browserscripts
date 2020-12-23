import recognitionBack from './recognition.back.html';
import recognitionFront from './recognition.front.html';
import style from './style.scss';
import writingBack from './writing.back.html';
import writingFront from './writing.front.html';

export const modelVersion = PRODUCTION ? 2 : 0;

export const dbRevision = 1;

export function modelName(version: number): string {
	return `jp:userscript:kanji:v${version}`;
}

export const model = {
	modelName: modelName(modelVersion),
	inOrderFields: ['Kanji', 'DB', 'Data'],
	css: style,
	cardTemplates: [
		/* eslint-disable @typescript-eslint/naming-convention */
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
		/* eslint-enable @typescript-eslint/naming-convention */
	],
};
