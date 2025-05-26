import { noop } from '@constellar/core'

import { Errable, error, success } from '../errable'
import {
	EmptyError,
	Fold,
	Fold1,
	scan,
	ScanProps,
	toDest,
} from '../operators/scan'
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

export function extract<Value, Index, Err, R, ES, EE>(
	source: Source<Value, Index, Err, R, Pull>,
	onSuccess: (r: R) => ES,
	onError: (r: Err) => EE,
): EE | ES {
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

export function extractAsync<Value, Index, Err, R, ES, EE>(
	source: Source<Value, Index, Err, R, Push>,
	onSuccess: (r: R) => ES,
	onError: (r: Err) => EE,
) {
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

export type ErrType<Err> = Err extends unknown ? undefined : never

export function collect<Value, Index, Acc, R, R2, Err>(
	props: Fold<Value, Acc, Index, R2>,
): (source: Source<Value, Index, Err, R, Pull>) => ErrType<Err> | R2
export function collect<Value, Index, R, R2, Err>(
	props: Fold1<Value, Index, R2>,
): (source: Source<Value, Index, Err, R, Pull>) => R2 | undefined
export function collect<Value, Index, Acc, R, R2, Err>(
	props: ScanProps<Value, Acc, Index, R2>,
) {
	return function (source: Source<Value, Index, Err, R, Pull>) {
		return extract(
			scan(toDest(props))(source),
			(r: R) => r,
			() => undefined,
		)
	}
}

export function collectAsync<Value, Index, Acc, R, R2, Err>(
	props: Fold<Value, Acc, Index, R2>,
): (source: Source<Value, Index, Err, R, Push>) => Promise<ErrType<Err> | R2>
export function collectAsync<Value, Index, R, R2, Err>(
	props: Fold1<Value, Index, R2>,
): (source: Source<Value, Index, Err, R, Push>) => Promise<R2 | undefined>
export function collectAsync<Value, Index, Acc, R, R2, Err>(
	props: ScanProps<Value, Acc, Index, R2>,
) {
	return function (source: Source<Value, Index, Err, R, Push>) {
		return extractAsync(
			scan(toDest(props))(source),
			(r: R) => r,
			() => undefined,
		)
	}
}

export function safeCollect<Value, Index, Acc, R, R2, Err>(
	props: Fold<Value, Acc, Index, R2>,
): (source: Source<Value, Index, Err, R, Pull>) => Errable<R2, ErrType<Err>>
export function safeCollect<Value, Index, R, R2, Err>(
	props: Fold1<Value, Index, R2>,
): (
	source: Source<Value, Index, Err, R, Pull>,
) => Errable<R2, EmptyError | ErrType<Err>>
export function safeCollect<Value, Index, Acc, R, R2, Err>(
	props: ScanProps<Value, Acc, Index, R2>,
) {
	return function (source: Source<Value, Index, Err, R, Pull>) {
		return extract(scan(toDest(props))(source), success, error)
	}
}

export function safeCollectAsync<Value, Index, Acc, R, R2, Err>(
	props: Fold<Value, Acc, Index, R2>,
): (
	source: Source<Value, Index, Err, R, Push>,
) => Promise<Errable<R2, ErrType<Err>>>
export function safeCollectAsync<Value, Index, R, R2, Err>(
	props: Fold1<Value, Index, R2>,
): (
	source: Source<Value, Index, Err, R, Push>,
) => Promise<Errable<R2, EmptyError | ErrType<Err>>>
export function safeCollectAsync<Value, Index, Acc, R, R2, Err>(
	props: ScanProps<Value, Acc, Index, R2>,
) {
	return function (source: Source<Value, Index, Err, R, Push>) {
		return extractAsync(scan(toDest(props))(source), success, error)
	}
}
