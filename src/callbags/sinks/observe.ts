import { id, noop } from '@constellar/core'
import { always } from '@prncss-xyz/utils'

import { Err, error, Succ, success } from '../errable'
import {
	AnyPullPush,
	ProObserver,
	Pull,
	Push,
	resolveObserver,
	Source,
} from '../sources'
import { deferCond } from './utils'

export function observe<Value, Index, Err, R>(
	observer: ProObserver<Value, Index, Err, R>,
) {
	return function (source: Source<Value, Index, Err, R, AnyPullPush>) {
		const { complete, error, next } = resolveObserver(observer)
		let opened = true
		const { pull, result, unmount } = source({
			complete() {
				opened = false
				deferCond(pull, () => {
					unmount()
					complete(result())
				})
			},
			error(err) {
				opened = false
				deferCond(pull, () => {
					unmount()
					error(err)
				})
			},
			next(value, index) {
				next(value, index)
			},
		})
		if (pull) while (opened) pull()
	}
}

export function toPush<Value, Index, Err>(
	source: Source<Value, Index, Err, void, Pull>,
): Source<Value, Index, Err, void, Push> {
	return function ({ complete, error, next }) {
		observe({
			error,
			next,
		})(source)
		complete()
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

export type ErrType_<Err, EE> = Err extends unknown ? EE : never

export function extract<Value, Index, Err, R, ES, EE>(
	onSuccess: (r: R) => ES,
	onError: (r: Err) => EE,
) {
	return function (
		source: Source<Value, Index, Err, R, Pull>,
	): ErrType_<Err, EE> | ES {
		let result: EE | ES
		observe({
			complete(r: R) {
				result = onSuccess(r)
			},
			error(r: Err) {
				result = onError(r)
			},
		})(source)
		return result!
	}
}

export function extractAsync<Value, Index, Err, R, ES, EE>(
	onSuccess: (r: R) => ES,
	onError: (r: Err) => EE,
) {
	return function (
		source: Source<Value, Index, Err, R, Push>,
	): Promise<ErrType_<Err, EE> | ES> {
		let complete: (value: EE | ES) => void
		const promise = new Promise<EE | ES>((resolve) => {
			complete = resolve
		})
		observe({
			complete(r: R) {
				complete(onSuccess(r))
			},
			error(r: Err) {
				complete(onError(r))
			},
		})(source)
		return promise
	}
}

export function val<Value, Index, Err, R>() {
	return extract<Value, Index, Err, R, R, undefined>(id, always(undefined))
}
export function valAsync<Value, Index, Err, R>() {
	return extractAsync<Value, Index, Err, R, R, undefined>(id, always(undefined))
}

export function safe<Value, Index, E, R>() {
	return extract<Value, Index, E, R, Succ<R>, Err<E>>(success, error)
}
export function safeAsync<Value, Index, E, R>() {
	return extractAsync<Value, Index, E, R, Succ<R>, Err<E>>(success, error)
}

export type ErrType<Err> = Err extends unknown ? undefined : never
