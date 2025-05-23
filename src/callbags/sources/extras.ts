import { noop } from '@constellar/core'

import { Push, Source } from './core'

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
