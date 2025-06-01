import { empty, Empty } from './empty'
import { Guarded, isUnknown, isVoid } from './guards'
import { union } from './unions'

const MAYBE = Symbol('MAYBE')
export const [isMaybe, { just, nothing }] = union(MAYBE, {
	just: isUnknown,
	nothing: isVoid,
})
export type Just<S> = Guarded<typeof just.is<S>>
export type Nothing = Guarded<typeof nothing.is>
export type Maybe<S> = Just<S> | Nothing

export const maybe = {
	onError: nothing.of.bind(nothing) as <E>(e: E) => Nothing,
	onSuccess: just.of.bind(just),
	shift<S>(
		value: Maybe<S>,
		onSuccess: (s: S) => void,
		onError: (e: Empty) => void,
	) {
		if (just.is(value)) onSuccess(just.unwrap(value))
		else onError(empty)
	},
}
