export const queries = {
	names: () => [/#names$/u, []] as const,
	sentences: () => [/#sentences$/u, []] as const,
	kanji: (query: string) =>
		[/#kanji$/u, ['#page_container', [/\p{sc=Han}/u.exec(query) ? 'h1.character' : '.literal_block']]] as const,
	// default: () =>
} as const;
