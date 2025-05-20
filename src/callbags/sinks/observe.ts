import { isFunction, noop } from '@constellar/core'

import { AnyPullPush, Pull, Push, Source } from '../sources'

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

export function observe<Value, Index, Err, R, P extends AnyPullPush>(
	source: Source<Value, Index, Err, R, P>,
	observer: Observer<Value, Index, Err, R>,
) {
	const { complete, error, next } = resolveObserver(observer)
	let opened = true
	const { pull, result, unmount } = source({
		close,
		error,
		push(value, index) {
			next(value, index)
		},
	})
	function close() {
		opened = false
		complete(result())
		unmount()
	}
	if (pull) while (opened) pull()
}

export function collect<Value, Index, Err, R>(
	source: Source<Value, Index, Err, R, Pull>,
): R {
	let result: R
	observe(source, {
		complete(r) {
			result = r
		},
		error(err) {
			throw err
		},
	})
	return result!
}

export function collectAsync<Value, Index, Err, R>(
	source: Source<Value, Index, Err, R, Push>,
) {
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
	})
	return promise
}
