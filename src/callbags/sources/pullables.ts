import { noop } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { Pull, Source } from './core'

export function empty<Value, Index, Err>(): Source<Value, Index, Err, void, Pull> {
	return function ({ close }) {
		close()
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
	return function ({ close, push }) {
		return {
			pull() {
				push(fromInit(init))
				close()
			},
			result: noop,
			unmount: noop,
		}
	}
}

export function iterable<Value>(
	init: Iterable<Value>,
): Source<Value, number, never, void, Pull> {
	return function ({ close, push }) {
		let index = 0
		const iterator = init[Symbol.iterator]()
		return {
			pull() {
				const next = iterator.next()
				if (next.done) {
					close()
					return
				}
				push(next.value, index++)
			},
			result: noop,
			unmount: noop,
		}
	}
}
