import { Guarded, isUnknown } from '../guards'
import { union } from './unions'

const EITHER = Symbol('EITHER')
export const [isEither, { error, success }] = union(EITHER, {
	error: isUnknown,
	success: isUnknown,
})
export type Success<S> = Guarded<typeof success.is<S>>
export type Err<E> = Guarded<typeof error.is<E>>
export type Either<S, E> = Err<E> | Success<S>

export function either<S, E>() {
	return {
		onError(e: E) {
			return error.of(e)
		},
		onSuccess(s: S) {
			return success.of(s)
		},
		shift(
			value: Either<S, E>,
			onSuccess: (s: S) => void,
			onError: (e: E) => void,
		) {
			if (success.is(value)) onSuccess(success.get(value))
			else onError(error.get(value))
		},
	}
}
