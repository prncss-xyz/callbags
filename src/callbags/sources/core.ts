import { isFunction, noop } from '@constellar/core'

import { DomainError } from '../../errors'

export interface Observer<Value, Index, Err extends DomainError, Res> {
	complete: (res: Res) => void
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
}

export type ProObserver<Value, Index, Err extends DomainError, Res = void> =
	| ((value: Value, index: Index) => void)
	| Partial<Observer<Value, Index, Err, Res>>

export function resolveObserver<Value, Index, Err extends DomainError, Res>(
	observer: ProObserver<Value, Index, Err, Res>,
) {
	if (isFunction(observer)) {
		return {
			complete: noop,
			error: noop,
			next: observer,
		}
	}
	return {
		complete: observer.complete ?? noop,
		error: observer.error ?? noop,
		next: observer.next ?? noop,
	}
}

export type Pull = () => void
export type Push = undefined
export type AnyPullPush = Pull | Push

export type Source<
	Value,
	Index,
	Err extends DomainError,
	R,
	P extends AnyPullPush,
> = (props: Observer<Value, Index, Err, void>) => {
	pull: P
	result(): R
	unmount(): void
}
