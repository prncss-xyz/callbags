import { noop } from '@constellar/core'

import { Source } from './core'

export function observable<Value, Index = void, Err = void>(): Source<
	Value,
	Index,
	Err,
	void
> {
	return function () {
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

export function interval(period: number): Source<number, number, never, void> {
	return function ({ push }) {
		let index = 0
		let handler = setInterval(() => {
			push(index, index)
			index++
		}, period)
		return {
			pull: undefined,
			result: noop,
			unmount() {
				clearInterval(handler)
			},
		}
	}
}

export function pushIterable<Value>(
	values: Iterable<Value>,
): Source<Value, number, never, void> {
	return function ({ close, push }) {
		let index = 0
		for (const value of values) {
			push(value, index++)
		}
		close()
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

export function asyncIterable<Value>(
	values: AsyncIterable<Value>,
): Source<Value, number, never, void> {
	return function ({ close, push }) {
		let index = 0
		;(async () => {
			for await (const value of values) {
				push(value, index++)
			}
			close()
		})()
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

export function empty<Value, Index, Err>(): Source<Value, Index, Err, void> {
	return function ({ close }) {
		close()
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}
