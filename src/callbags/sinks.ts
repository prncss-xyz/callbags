import { isFunction, noop } from '@constellar/core'

import { Source } from './sources'

interface ResolvedObserver<Value, Index, Err, R> {
	complete: (r: R) => void
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
}

type Observer<Value, Index, Err, R = void> =
	| ((value: Value, index: Index) => void)
	| Partial<ResolvedObserver<Value, Index, Err, R>>

function resolveObserver<Value, Index, Err, R>(
	observer: Observer<Value, Index, Err, R>,
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
		const { mount, pull, result } = source({
			close,
			error,
			pass() {
				pull()
			},
			push: (v, k) => {
				next(v, k)
			},
		})(init)
		cleanup = mount()
		function close() {
			complete(result())
			cleanup()
		}
		pull()
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
	return function (init: Init): Promise<R> {
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
