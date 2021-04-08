import { assert } from './assert';

export function assertReturn<T>(value: T | null | undefined, errorMessage?: string): T {
	assert(value, errorMessage);
	return value;
}
