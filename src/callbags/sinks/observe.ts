import { noop, pipe2 } from '@constellar/core'

import { Errable, error, success } from '../errable'
import { ProObserver, Pull, Push, resolveObserver, Source } from '../sources'

export function observe<Value, Index, Err, R>(
	source: Source<Value, Index, Err, R, Pull>,
	observer: ProObserver<Value, Index, Err, R>,
) {
	const { complete, error, next } = resolveObserver(observer)
	let opened = true
	const { pull, result, unmount } = source({
		complete() {
			opened = false
			unmount()
			complete(result())
		},
		error(err) {
			opened = false
			unmount()
			error(err)
		},
		next(value, index) {
			next(value, index)
		},
	})
	while (opened) pull()
}

export function preCollectSync<Value, Index, Err, R>(
	source: Source<Value, Index, Err, R, Pull>,
	onSuccess: (() => void) | ((res: R) => void),
	onError: (() => void) | ((fail: Err) => void),
) {
	let opened = true
	const { pull, result, unmount } = source({
		complete() {
			opened = false
			unmount()
			onSuccess(result())
		},
		error(err) {
			opened = false
			unmount()
			onError(err)
		},
		next: noop,
	})
	while (opened) pull()
}

export function defer(cb: () => void) {
	setTimeout(cb, 0)
}

export function preCollectAsync<Value, Index, Err, R>(
	source: Source<Value, Index, Err, R, Push>,
	onSuccess: (() => void) | ((res: R) => void),
	onError: (() => void) | ((fail: Err) => void),
) {
	const { result, unmount } = source({
		complete() {
			defer(() => {
				unmount()
				onSuccess(result())
			})
		},
		error(e) {
			defer(() => {
				unmount()
				onError(e)
			})
		},
		next: noop,
	})
}

type ResType<Err, R> = (Err extends unknown ? undefined : R) | R

export function collect<Value, Index, R, Err>(
	source: Source<Value, Index, Err, R, Pull>,
): ResType<Err, R> {
	let result: R | undefined
	preCollectSync(
		source,
		(r) => {
			result = r
		},
		() => {
			result = undefined
		},
	)
	return result!
}

export function collectAsync<Value, Index, R, Err>(
	source: Source<Value, Index, Err, R, Push>,
): Promise<ResType<Err, R>> {
	let resolve: (result: R | undefined) => void
	const promise = new Promise<R | undefined>((resolve_) => {
		resolve = resolve_
	})
	preCollectAsync(source, resolve!, () => resolve(undefined))
	return promise
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

export function safeCollectAsync<Value, Index, Err, R>(
	source: Source<Value, Index, Err, R, Push>,
) {
	let complete: (value: Errable<R, Err>) => void
	const promise = new Promise<Errable<R, Err>>((resolve) => {
		complete = resolve
	})
	preCollectAsync(source, pipe2(success, complete!), pipe2(error, complete!))
	return promise
}
