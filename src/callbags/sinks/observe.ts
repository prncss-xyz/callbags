import { isFunction, noop } from '@constellar/core'

import { Source } from '../sources'

interface ResolvedObserver<Value, Index, Err, Res> {
	complete: (res: Res) => void
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
}

type Observer<Value, Index, Err, Res = void> =
	| ((value: Value, index: Index) => void)
	| Partial<ResolvedObserver<Value, Index, Err, Res>>

function resolveObserver<Value, Index, Err, Res>(
	observer: Observer<Value, Index, Err, Res>,
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

export function observe<Init, Value, Index, Err, R>(
	source: Source<Init, Value, Index, Err, R>,
	observer: Observer<Value, Index, Err, R>,
) {
	const { complete, error, next } = resolveObserver(observer)
	return function (init: Init) {
		let cleanup: () => void
		let opened = true
		const { mount, pull, result } = source({
			close,
			error,
			pass: noop,
			push: next,
		})(init)
		cleanup = mount()
		function close() {
			opened = false
			complete(result())
			cleanup()
		}
		if (pull) while (opened) pull()
	}
}

export function collect<Init, Value, Index, Err, R>(
	source: Source<Init, Value, Index, Err, R>,
) {
	return function (init: Init): R {
		let result: R
		observe(source, {
			complete(r) {
				result = r
			},
			error(err) {
				throw err
			},
		})(init)
		// TODO: make this type-safe
		return result!
	}
}

export function collectAsync<Init, Value, Index, Err, R>(
	source: Source<Init, Value, Index, Err, R>,
) {
	return function (init: Init) {
		let resolve: (result: R) => void
		let reject: (result: any) => void
		const promise = new Promise<R>((resolve_, reject_) => {
			resolve = resolve_
			reject = reject_
		})
		observe(source, {
			complete(r) {
				resolve(r)
			},
			error(e) {
				reject(e)
			},
		})(init)
		return promise
	}
}
