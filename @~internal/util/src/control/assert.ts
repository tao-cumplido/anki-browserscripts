export function assert<T>(value: T | null | undefined, errorMessage = 'value assertion failed'): asserts value is T {
	if (value === null || typeof value === 'undefined') {
		throw new Error(errorMessage);
	}
}
