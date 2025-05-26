import { id, noop } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { AnyPullPush, Observer, Source } from '../../sources'

const emptyError = 'empty'
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
	head?: true
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
							if (foldProps.head) {
								props.complete(result(value as any))
							} else {
								acc = fold(value, acc, index)
								props.next(result(acc), index)
							}
							dirty = true
						} else {
							acc = value as any
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

export function voidFold<Value, Index>(): Fold<Value, void, Index> {
	return {
		fold: noop,
		init: noop,
	}
}

export function valueFold<Value, Index>(): Fold1<Value, Index> {
	return {
		fold: id,
	}
}

export function headFold<Value, Index>(): Fold1<Value, Index> {
	return {
		fold: id,
		head: true,
	}
}

export function arrayFold<Value, Index>(): Fold<Value, Value[], Index> {
	return {
		fold: (t, acc) => [...acc, t],
		foldDest(t, acc) {
			acc.push(t)
			return acc
		},
		init: () => [],
	}
}
