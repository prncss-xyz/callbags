import { id } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { Source } from '../sources'

export interface Fold<Value, Acc, Index, R = Acc> {
	fold: (value: Value, acc: Acc, index: Index, close: () => void) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => R
}

export function scan<Value, Index, Acc, R = Acc>({
	fold,
	init,
	result = id<any>,
}: Fold<Value, Acc, Index, R>) {
	return function <Init, Err, R2>(
		source: Source<Init, Value, Index, Err, R2>,
	): Source<Init, Acc, Index, Err, R> {
		return function (args) {
			return function (init_) {
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
					})(init_),
					result() {
						return result(acc)
					},
				}
			}
		}
	}
}

export function valueFold<Value, Index>(): Fold<
	Value,
	undefined | Value,
	Index,
	undefined | Value
> {
	return {
		fold: id,
		init: undefined,
	}
}

export function arrayFold<Value, Index>(): Fold<Value, Value[], Index> {
	return {
		fold: (t, acc) => (acc.push(t), acc),
		init: () => [],
	}
}

export function arrayFoldCopy<Value, Index>(): Fold<Value, Value[], Index> {
	return {
		fold: (t, acc) => [...acc, t],
		init: () => [],
	}
}
