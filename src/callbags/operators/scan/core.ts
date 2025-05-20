import { id } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { AnyPullPush, Source } from '../../sources'

export interface Fold<Value, Acc, Index> {
	fold: (value: Value, acc: Acc, index: Index, close: () => void) => Acc
	init: Init<Acc>
}

export function scan1<Value, Index>(fold: (acc: Value, value: Value) => Value) {
	return function <Err, R, P extends AnyPullPush>(
		source: Source<Value, Index, Err, R, P>,
	): Source<Value, Index, Err, Value, P> {
		return function (args) {
			let closed = false
			function close() {
				closed = true
			}
			let first = true
			let acc: Value
			return {
				...source({
					...args,
					push(value, index) {
						if (first) {
							acc = value
							first = false
						} else {
							acc = fold(acc, value)
						}
						args.push(acc, index)
						if (closed) close()
					},
				}),
				result() {
					return acc
				},
			}
		}
	}
}

export function scan<Value, Index, Acc>({
	fold,
	init,
}: Fold<Value, Acc, Index>) {
	return function <Err, R, P extends AnyPullPush>(
		source: Source<Value, Index, Err, R, P>,
	): Source<Acc, Index, Err, Acc, P> {
		return function (args) {
			let closed = false
			function close() {
				closed = true
			}
			let acc = fromInit(init)
			return {
				...source({
					...args,
					push(value, index) {
						acc = fold(value, acc, index, close)
						args.push(acc, index)
						if (closed) close()
					},
				}),
				result() {
					return acc
				},
			}
		}
	}
}

export function valueFold<Value, Index>(): Fold<
	Value,
	undefined | Value,
	Index
> {
	return {
		fold: id,
		init: undefined,
	}
}

export function arrayFold<Value, Index>(): Fold<Value, Value[], Index> {
	return {
		fold(t, acc) {
			acc.push(t)
			return acc
		},
		init: () => [],
	}
}

export function arrayFoldCopy<Value, Index>(): Fold<Value, Value[], Index> {
	return {
		fold: (t, acc) => [...acc, t],
		init: () => [],
	}
}
