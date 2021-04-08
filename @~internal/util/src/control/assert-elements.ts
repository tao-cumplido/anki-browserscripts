import type { Element, ParentNode } from '@tswt/core';

import { assertReturn } from './assert-return';

type MultiQuery = readonly [string, number?, number?];

type Query = string | MultiQuery;

type QueryElements<Q extends readonly Query[]> = {
	[P in keyof Q]: Q[P] extends string
		? ParentNode.ElementLookup<Q[P]>
		: Q[P] extends MultiQuery
		? ReadonlyArray<ParentNode.ElementLookup<Q[P][0]>>
		: Element;
};

export function assertElements<Q extends readonly Query[]>(node: ParentNode, ...queries: Q): QueryElements<Q> {
	try {
		return (queries.map((query) => {
			if (typeof query === 'string') {
				return assertReturn(node.querySelector(query), `expected selector '${query}' to match`);
			}

			const [selector, min = 0, max = Infinity] = query;

			const result = node.querySelectorAll(selector);

			if (result.length < min) {
				throw new RangeError(`expected at least ${min} matches for selector '${selector}' but got ${result.length}`);
			}

			if (result.length > max) {
				throw new RangeError(`expected no more than ${max} matches for selector '${selector}' but got ${result.length}`);
			}

			return [...result];
		}) as unknown) as QueryElements<Q>;
	} catch (error: unknown) {
		throw error instanceof Error ? new ReferenceError(error.message) : error;
	}
}
