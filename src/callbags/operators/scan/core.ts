import { id } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { AnyPullPush, Observer, Source } from '../../sources'

interface Fold_<Value, Acc, Index> {
	fold: (value: Value, acc: Acc, index: Index, close: () => void) => Acc
	init?: Init<Acc>
}

export interface Fold<Value, Acc, Index> {
	fold: (value: Value, acc: Acc, index: Index, close: () => void) => Acc
	init: Init<Acc>
}

export interface Fold1<Acc, Index> {
	fold: (value: Acc, acc: Acc, index: Index, close: () => void) => Acc
}

export function scan<Value, Index, Acc>({
	fold,
	init,
}: Fold<Value, Acc, Index>): <Err, R, P extends AnyPullPush>(
	source: Source<Value, Index, Err, R, P>,
) => Source<Acc, Index, Err, Acc, P>
export function scan<Acc, Index>({
	fold,
}: Fold1<Acc, Index>): <Err, R, P extends AnyPullPush>(
	source: Source<Acc, Index, Err, R, P>,
) => Source<Acc, Index, Err, Acc | undefined, P>
export function scan<Value, Index, Acc>(foldProps: Fold_<Value, Acc, Index>) {
	return function <Err, R, P extends AnyPullPush>(
		source: Source<Value, Index, Err, R, P>,
	) {
		return function (props: Observer<Acc, Index, Err, void>) {
			const fold = foldProps.fold
			let completed = false
			function complete() {
				completed = true
			}
			let acc: Acc
			let dirty = false
			if ('init' in foldProps) {
				dirty = true
				acc = fromInit(foldProps.init!)
			}
			return {
				...source({
					...props,
					next(value, index) {
						if (dirty) acc = fold(value, acc, index, complete)
						else {
							dirty = true
							acc = value as any
						}
						props.next(acc, index)
						if (completed) complete()
					},
				}),
				result(): any {
					return dirty ? acc : (undefined as any)
				},
			}
		}
	}
}

export function valueFold<Value, Index>(): Fold1<Value, Index> {
	return {
		fold: id,
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
