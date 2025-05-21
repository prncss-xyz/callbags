import { noop } from '@constellar/core'

import { Push, Source } from './core'

export function observable<Value, Index = void, Err = void>(): Source<
	Value,
	Index,
	Err,
	void,
	Push
> {
	return function () {
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

export function interval(
	period: number,
): Source<number, number, never, void, Push> {
	return function ({ next }) {
		let index = 0
		let handler = setInterval(() => {
			next(index, index)
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

export function asyncIterable<Value>(
	values: AsyncIterable<Value>,
): Source<Value, number, never, void, Push> {
	return function ({ complete, next }) {
		let index = 0
		;(async () => {
			for await (const value of values) {
				next(value, index++)
			}
			complete()
		})()
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}
