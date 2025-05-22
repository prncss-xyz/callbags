import { id } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { AnyPullPush, Observer, Source } from '../../sources'

export interface Fold<Value, Acc, Index, R = Acc> {
	fold: (value: Value, acc: Acc, index: Index) => Acc
	foldDest?: (value: Value, acc: Acc, index: Index) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => R
}

export interface Fold1<Acc, Index, R = Acc, Or = undefined> {
	fold: (value: Acc, acc: Acc, index: Index) => Acc
	foldDest?: (value: Acc, acc: Acc, index: Index) => Acc
	or?: () => Or
	result?: (acc: Acc) => R
}

interface ScanProps<Value, Acc, Index, R, Or> {
	fold: (value: Value, acc: Acc, index: Index) => Acc
	init?: Init<Acc>
	or?: () => Or
	result?: (acc: Acc) => R
}

export function scan<Value, Index, Acc, R = Acc>(
	props: Fold<Value, Acc, Index, R>,
): <Err, RS, P extends AnyPullPush>(
	source: Source<Value, Index, Err, RS, P>,
) => Source<Acc, Index, Err, R, P>
export function scan<Acc, Index, R = Acc, Or = undefined>(
	props: Fold1<Acc, Index, Acc, Or>,
): <Err, RS, P extends AnyPullPush>(
	source: Source<Acc, Index, Err, RS, P>,
) => Source<Acc, Index, Err, Or | R, P>
export function scan<Value, Index, Acc, R, Alt>(
	foldProps: ScanProps<Value, Acc, Index, R, Alt>,
) {
	return function <Err, R, P extends AnyPullPush>(
		source: Source<Value, Index, Err, R, P>,
	) {
		return function (props: Observer<Acc, Index, Err, void>) {
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
					next(value, index) {
						if (dirty) acc = fold(value, acc, index)
						else {
							dirty = true
							acc = value as any
						}
						props.next(result(acc), index)
					},
				}),
				result() {
					if (dirty) return result(acc)
					const alt = foldProps.or
					if (alt) return alt()
					return undefined
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
