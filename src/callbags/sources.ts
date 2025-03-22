import { noop } from '@constellar/core'

export type Source<Init, Value, Index, Err, R> = (args: {
	close(): void
	error(err: Err): void
	pass(): void
	push(value: Value, index: Index): void
}) => (init: Init) => {
	mount(): () => void
	pull(): void
	result(): R
}

export function empty<Init, Value, Index, Err>(): Source<
	Init,
	Value,
	Index,
	Err,
	void
> {
	return function ({ close }) {
		return function () {
			close()
			return {
				mount() {
					return noop
				},
				pull: noop,
				result: noop,
			}
		}
	}
}

export function iterable<Value>(): Source<
	Iterable<Value>,
	Value,
	number,
	never,
	void
> {
	return function ({ close, pass, push }) {
		return function (init) {
			let index = 0
			const iterator = init[Symbol.iterator]()
			return {
				mount() {
					return noop
				},
				pull() {
					const next = iterator.next()
					if (next.done) {
						close()
						return
					}
					push(next.value, index++)
					pass()
				},
				result: noop,
			}
		}
	}
}

export function interval(
	period: number,
): Source<void, number, number, never, void> {
	return function ({ push }) {
		return function () {
			let count = 0
			return {
				mount() {
					let handler = setInterval(() => {
						push(count, count)
						count++
					}, period)
					return function () {
						clearInterval(handler)
					}
				},
				pull: noop,
				result: noop,
			}
		}
	}
}
