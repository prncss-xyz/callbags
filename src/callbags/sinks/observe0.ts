import { noop, pipe2 } from '@constellar/core'

import { Errable, error, success } from '../errable'
import {
	AnyPullPush,
	ProObserver,
	Pull,
	resolveObserver,
	Source,
} from '../sources'

export function observe<Value, Index, Err, R, P extends AnyPullPush>(
	source: Source<Value, Index, Err, R, P>,
	observer: ProObserver<Value, Index, Err, R>,
) {
	const { complete, error, next } = resolveObserver(observer)
	let opened = true
	const { pull, result, unmount } = source({
		complete() {
			opened = false
			complete(result())
			unmount()
		},
		error(err) {
			unmount()
			error(err)
		},
		next(value, index) {
			next(value, index)
		},
	})
	if (pull) while (opened) pull()
}

export function collect<Value, Index, R>(
	source: Source<Value, Index, never, R, Pull>,
): R {
	let result: R
	observe(source, {
		complete(r) {
			result = r
		},
		error: noop,
	})
	return result!
}

export function safeCollect<Value, Index, Err, R>(
	source: Source<Value, Index, Err, R, Pull>,
): Errable<R, Err> {
	let result: Errable<R, Err>
	observe(source, {
		complete(r) {
			result = success(r)
		},
		error(r) {
			result = error(r)
		},
	})
	return result!
}

export function collectAsync<Value, Index, R>(
	source: Source<Value, Index, never, R, AnyPullPush>,
) {
	let complete: (result: R) => void
	const promise = new Promise<R>((resolve) => {
		complete = resolve
	})
	observe(source, { complete: complete!, error: noop })
	return promise
}

export function safeCollectAsync<Value, Index, Err, R>(
	source: Source<Value, Index, Err, R, AnyPullPush>,
) {
	let complete: (value: Errable<R, Err>) => void
	const promise = new Promise<Errable<R, Err>>((resolve) => {
		complete = resolve
	})
	observe(source, {
		complete: pipe2(success, complete!),
		error: pipe2(error, complete!),
	})
	return promise
}
