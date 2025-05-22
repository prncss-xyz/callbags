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
		error,
		next(value, index) {
			next(value, index)
		},
	})
	if (pull) while (opened) pull()
}

export function observeAsync<Value, Index, Err, R, P extends AnyPullPush>(
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
		error,
		next(value, index) {
			next(value, index)
		},
	})
	setTimeout(() => {
		if (pull) while (opened) pull()
	}, 0)
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
	source: Source<Value, Index, Err, R, AnyPullPush>,
) {
	let resolve: (result: R) => void
	let reject: (result: any) => void
	const promise = new Promise<R>((resolve_, reject_) => {
		resolve = resolve_
		reject = reject_
	})
	observeAsync(source, {
		complete(r) {
			resolve(r)
		},
		error(e) {
			reject(e)
		},
	})
	return promise
}
