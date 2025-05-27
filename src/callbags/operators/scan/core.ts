import { id } from '@constellar/core'
import { fromInit, Init, isoAssert } from '@prncss-xyz/utils'

import { AnyPullPush, Observer, Source } from '../../sources'

const emptyError = { type: 'empty' }
export type EmptyError = typeof emptyError

export interface Fold<Value, Acc, Index, R = Acc> {
	fold: (value: Value, acc: Acc, index: Index) => Acc
	foldDest?: (value: Value, acc: Acc, index: Index) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => R
}

export interface Fold1<Acc, Index, R = Acc> {
	fold: (value: Acc, acc: Acc, index: Index) => Acc
	foldDest?: (value: Acc, acc: Acc, index: Index) => Acc
	result?: (acc: Acc) => R
}

export interface ScanProps<Value, Acc, Index, R> {
	fold: (value: Value, acc: Acc, index: Index) => Acc
	foldDest?: (value: Acc, acc: Acc, index: Index) => Acc
	head?: true
	init?: Init<Acc>
	result?: (acc: Acc) => R
}

export function toDest<Value, Acc, Index, R>(
	props: Fold<Value, Acc, Index, R>,
): Fold<Value, Acc, Index, R>
export function toDest<Acc, Index, R>(
	props: Fold1<Acc, Index, R>,
): Fold1<Acc, Index, R>
export function toDest<Value, Acc, Index, R>(
	props: ScanProps<Value, Acc, Index, R>,
): ScanProps<Value, Acc, Index, R>
export function toDest<Value, Acc, Index, R>(
	props: ScanProps<Value, Acc, Index, R>,
) {
	return {
		fold: props.foldDest ?? props.fold,
		init: props.init,
		result: props.result,
	}
}

export function scan<Value, Index, Acc, R>(
	props: Fold<Value, Acc, Index, R>,
): <Err, RS, P extends AnyPullPush>(
	source: Source<Value, Index, Err, RS, P>,
) => Source<Acc, Index, Err, R, P>
export function scan<Acc, Index>(
	props: Fold1<Acc, Index, Acc>,
): <Err, RS, P extends AnyPullPush>(
	source: Source<Acc, Index, Err, RS, P>,
) => Source<Acc, Index, EmptyError | Err, Acc, P>
export function scan<Value, Index, Acc, R>(
	foldProps: ScanProps<Value, Acc, Index, R>,
): <Err, R, P extends AnyPullPush>(
	source: Source<Value, Index, Err, R, P>,
) => (props: Observer<Acc, Index, EmptyError | Err, void>) => {
	pull: P
	result(): any
	unmount(): void
}
export function scan<Value, Index, Acc, R>(
	foldProps: ScanProps<Value, Acc, Index, R>,
) {
	return function <Err, R, P extends AnyPullPush>(
		source: Source<Value, Index, Err, R, P>,
	) {
		return function (
			props: Observer<Acc, Index, Err | typeof emptyError, void>,
		) {
			const fold = foldProps.fold
			const result = foldProps.result ?? id<any>
			let acc: Acc
			let dirty = false
			if ('init' in foldProps) {
				dirty = true
				acc = fromInit(foldProps.init!)
			}
			return {
				...source({
					...props,
					complete(res) {
						if (dirty) {
							props.complete(res)
						} else {
							props.error(emptyError)
						}
					},
					next(value, index) {
						if (dirty) {
							acc = fold(value, acc, index)
							props.next(result(acc), index)
						} else {
							acc = value as any
							dirty = true
							props.next(result(acc), index)
						}
					},
				}),
				result() {
					if (dirty) return result(acc)
					throw new Error('unexpected codepath')
				},
			}
		}
	}
}

export function fold<Value, Index, Acc, R>(
	props: Fold<Value, Acc, Index, R>,
): <Err, RS, P extends AnyPullPush>(
	source: Source<Value, Index, Err, RS, P>,
) => Source<void, void, Err, R, P>
export function fold<Acc, Index>(
	props: Fold1<Acc, Index, Acc>,
): <Err, RS, P extends AnyPullPush>(
	source: Source<Acc, Index, Err, RS, P>,
) => Source<void, void, EmptyError | Err, Acc, P>
export function fold<Value, Index, Acc, R>(
	foldProps: ScanProps<Value, Acc, Index, R>,
) {
	return scan(toDest(foldProps))
}

export function first<Value, Index>() {
	return function <Err, R, P extends AnyPullPush>(
		source: Source<Value, Index, Err, R, P>,
	) {
		return function (
			props: Observer<Value, Index, Err | typeof emptyError, void>,
		) {
			let acc: Value
			let dirty = false
			return {
				...source({
					...props,
					complete(res) {
						if (dirty) {
							props.complete(res)
						} else {
							props.error(emptyError)
						}
					},
					next(value) {
						acc = value
						dirty = true
						props.complete()
					},
				}),
				result() {
					isoAssert(dirty, 'unexpected codepath')
					return acc
				},
			}
		}
	}
}

export function last<Value, Index>(): Fold1<Value, Index> {
	return {
		fold: id,
	}
}

export function collect<Value, Index>(): Fold<Value, Value[], Index> {
	return {
		fold: (t, acc) => [...acc, t],
		foldDest(t, acc) {
			acc.push(t)
			return acc
		},
		init: () => [],
	}
}
