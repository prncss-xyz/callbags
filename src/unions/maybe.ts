import { DomainError } from '../errors'
import { Guarded, isUnknown, isVoid } from '../guards'
import { union } from './unions'

const MAYBE = Symbol('MAYBE')
export const [isMaybe, { just, nothing }] = union(MAYBE, {
	just: isUnknown,
	nothing: isVoid,
})
export type Just<S> = Guarded<typeof just.is<S>>
export type Nothing = Guarded<typeof nothing.is>
export type Maybe<S> = Just<S> | Nothing

export class NothingError extends DomainError {}

export function maybe<S, E>() {
	return {
		onError(_e: E) {
			return nothing.void()
		},
		onSuccess(s: S) {
			return just.of(s)
		},
		shift(
			value: Maybe<S>,
			onSuccess: (s: S) => void,
			onError: (e: unknown) => void,
		) {
			if (just.is(value)) onSuccess(just.get(value))
			else onError(new NothingError())
		},
	}
}
