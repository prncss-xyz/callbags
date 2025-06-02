import { id } from '@constellar/core'

export function value<S, E>() {
	return {
		onError: (_e: E) => undefined,
		onSuccess: id<S>,
		shift(value: S, onSuccess: (s: S) => void, _onError: (e: never) => void) {
			onSuccess(value)
		},
	}
}
