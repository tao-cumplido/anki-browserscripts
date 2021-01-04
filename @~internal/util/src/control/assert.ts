export function assert<T>(value: T, errorMessage = 'value assertion failed'): NonNullable<T> {
	if (value === null || typeof value === 'undefined') {
		throw new Error(errorMessage);
	}

	return value as NonNullable<T>;
}
