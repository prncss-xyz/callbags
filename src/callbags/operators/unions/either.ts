import { Guarded, isUnknown } from './guards'
import { union } from './unions'

const EITHER = Symbol('EITHER')
export const [isEither, { error, success }] = union(EITHER, {
	error: isUnknown,
	success: isUnknown,
})
export type Success<S> = Guarded<typeof success.is<S>>
export type Err<E> = Guarded<typeof error.is<E>>
export type Either<S, E> = Err<E> | Success<S>

export const either = {
	onError: error.of.bind(error),
	onSuccess: success.of.bind(success),
	shift<S, E>(
		value: Either<S, E>,
		onSuccess: (s: S) => void,
		onError: (e: E) => void,
	) {
		if (success.is(value)) onSuccess(success.unwrap(value))
		else onError(error.unwrap(value))
	},
}
