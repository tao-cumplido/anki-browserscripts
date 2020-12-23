import type { Actions } from './actions';

type Result<T extends keyof Actions> = Actions[T]['result'];

type CheckedResponse<T extends keyof Actions> = { result: Result<T>; error: null } | { result: null; error: string };

type ParamKeys = {
	// eslint-disable-next-line @typescript-eslint/ban-types
	[P in keyof Actions]: Actions[P] extends { request: object } ? P : never;
}[keyof Actions];

type Params<T extends ParamKeys> = Actions[T]['request'];

function checkResponse<T extends keyof Actions>(response: unknown): CheckedResponse<T> {
	if (typeof response !== 'object' || !response || !('result' in response && 'error' in response)) {
		throw new Error('invalid response from anki connect');
	}

	return response as CheckedResponse<T>;
}

export async function request<T extends ParamKeys>(action: T, params: Params<T>): Promise<Result<T>>;
export async function request<T extends Exclude<keyof Actions, ParamKeys>>(action: T): Promise<Result<T>>;
export async function request<T extends keyof Actions>(action: T, params?: unknown): Promise<Result<T>> {
	const version: Result<'version'> = 6;

	const response = checkResponse(
		await fetch('http://localhost:8765', {
			method: 'POST',
			body: JSON.stringify({
				action,
				params,
				version,
			}),
		}).then(async ($) => $.json()),
	);

	if (response.error !== null) {
		throw new Error(response.error);
	}

	return response.result;
}
