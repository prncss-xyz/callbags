import { noop } from '@constellar/core'

import { Source } from './core'

export function observable<Value, Index = void, Err = void>(): Source<
	void,
	Value,
	Index,
	Err,
	void
> {
	return function () {
		return function () {
			return {
				mount() {
					return noop
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
				result: noop,
			}
		}
	}
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
				result: noop,
			}
		}
	}
}
