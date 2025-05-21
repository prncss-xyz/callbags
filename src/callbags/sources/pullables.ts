import { noop } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { Pull, Source } from './core'

export function empty<Value, Index, Err>(): Source<
	Value,
	Index,
	Err,
	void,
	Pull
> {
	return function ({ complete }) {
		complete()
		return {
			pull: noop,
			result: noop,
			unmount: noop,
		}
	}
}

/**
 * @param init - a value or a function returning this value
 * @returns a source emitting the value once
 */
export function once<Value>(
	init: Init<Value>,
): Source<Value, void, never, void, Pull> {
	return function ({ complete, next }) {
		return {
			pull() {
				next(fromInit(init))
				complete()
			},
			result: noop,
			unmount: noop,
		}
	}
}

export function iterable<Value>(
	init: Iterable<Value>,
): Source<Value, number, never, void, Pull> {
	return function ({ complete, next }) {
		let index = 0
		const iterator = init[Symbol.iterator]()
		return {
			pull() {
				const result = iterator.next()
				if (result.done) {
					complete()
					return
				}
				next(result.value, index++)
			},
			result: noop,
			unmount: noop,
		}
	}
}
