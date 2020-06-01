declare module '*/data.json' {
   const content: Partial<Record<string, import('./kanji').KanjiEntry>>;
   export default content;
}
