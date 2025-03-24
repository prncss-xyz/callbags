import { noop } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { Source } from './core'

export function once<Value>(): Source<Init<Value>, Value, void, never, void> {
	return function ({ close, push }) {
		return function (init) {
			return {
				mount() {
					return noop
				},
				pull() {
					push(fromInit(init))
					close()
				},
				result: noop,
			}
		}
	}
}

export function onceAsync<Value>(): Source<
	Init<Promise<Value>>,
	Value,
	void,
	never,
	void
> {
	return function ({ close, push }) {
		return function (init) {
			return {
				mount() {
					return noop
				},
				pull() {
					fromInit(init).then((value) => {
						push(value)
						close()
					})
				},
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

export function iterableAsync<Value>(): Source<
	Iterable<Value>,
	Value,
	number,
	never,
	void
> {
	return function ({ close, pass, push }) {
		return function (init) {
			let index = 0
			const iterator = init[Symbol.asyncIterator]()
			return {
				mount() {
					return noop
				},
				pull() {
					iterator.next().then((next) => {
						if (next.done) {
							close()
							return
						}
						push(next.value, index++)
						pass()
					})
				},
				result: noop,
			}
		}
	}
}
