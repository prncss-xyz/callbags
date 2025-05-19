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
			result: noop,
			unmount() {
				clearInterval(handler)
			},
		}
	}
}

export function pushIterable2<Value>(
	values: Iterable<Value>,
): Source<Value, number, never, void> {
	return function ({ close, push }) {
		let index = 0
		for (const value of values) {
			push(value, index++)
		}
		close()
		return {
			result: noop,
			unmount: noop,
		}
	}
}

export function pushIterable<Value>(
	p: Promise<Iterable<Value>>,
): Source<Value, number, never, void> {
	return function ({ close, push }) {
		let index = 0
		p.then((values) => {
			for (const value of values) {
				push(value, index++)
			}
			close()
		})
		return {
			result: noop,
			unmount: noop,
		}
	}
}

export function pushIterableAsync<Value>(
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
			result: noop,
			unmount: noop,
		}
	}
}

export function empty<Value, Index, Err>(): Source<Value, Index, Err, void> {
	return function ({ close }) {
		close()
		return {
			result: noop,
			unmount: noop,
		}
	}
}
