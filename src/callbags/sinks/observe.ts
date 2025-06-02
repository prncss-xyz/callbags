import { noop } from '@constellar/core'

import {
	AnyPullPush,
	ProObserver,
	Pull,
	Push,
	resolveObserver,
	Source,
} from '../sources/core'
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

export function extract<Value, Index, Err, R, ES, EE, P extends AnyPullPush>({
	onError,
	onSuccess,
}: {
	onError: (r: Err) => EE
	onSuccess: (r: R) => ES
}) {
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
