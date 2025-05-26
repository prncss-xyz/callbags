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

type ErrType<Err, EE> = Err extends unknown ? EE : never
type CP<P extends AnyPullPush, V> = P extends Pull
	? V
	: P extends Push
		? Promise<V>
		: never

function extract<Value, Index, Err, R, ES, EE, P extends AnyPullPush>(
	onSuccess: (r: R) => ES,
	onError: (r: Err) => EE,
) {
	return function (
		source: Source<Value, Index, Err, R, P>,
	): CP<P, ErrType<Err, EE> | ES> {
		type ResErr = ErrType<Err, EE> | ES
		let result: ResErr
		let dirty = false
		let complete = (value: ResErr) => {
			result = value
			dirty = true
		}
		observe({
			complete(r: R) {
				complete(onSuccess(r))
			},
			error(r: Err) {
				complete(onError(r))
			},
		})(source)
		if (dirty) return result! as any
		const promise = new Promise<ResErr>((resolve) => {
			complete = resolve
		})
		return promise as any
	}
}

export function val<Value, Index, Err, R, P extends AnyPullPush>() {
	return extract<Value, Index, Err, R, R, undefined, P>(id, always(undefined))
}

export function safe<Value, Index, E, R, P extends AnyPullPush>() {
	return extract<Value, Index, E, R, Succ<R>, Err<E>, P>(success, error)
}
