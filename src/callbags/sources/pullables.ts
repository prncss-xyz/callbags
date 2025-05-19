import { noop } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { Source } from './core'

/**
 * @param init - a value or a function returning this value
 * @returns a source emitting the value once
 */
export function once<Value>(
	init: Init<Value>,
): Source<Value, void, never, void> {
	return function ({ close, push }) {
		return {
			pull() {
				push(fromInit(init))
				close()
				return
			},
			result: noop,
			unmount: noop,
		}
	}
}

export function onceAsync<Value>(
	init: Init<Promise<Value>>,
): Source<Value, void, never, void> {
	return function ({ close, push }) {
		fromInit(init).then((value) => {
			push(value)
			close()
			return
		})
		return {
			result: noop,
			unmount: noop,
		}
	}
}

export function iterable<Value>(
	init: Iterable<Value>,
): Source<Value, number, never, void> {
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
