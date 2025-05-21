import { noop } from '@constellar/core'
import { thrush } from '@prncss-xyz/utils'

import { AnyPullPush, Source } from '../sources'

export function flatten<
	Value,
	IO,
	EO,
	RO,
	II,
	EI,
	RI,
	P extends AnyPullPush,
>() {
	return function (
		sources: Source<Source<Value, II, EI, RI, P>, IO, EO, RO, P>,
	): Source<Value, IO, EI | EO, void, P> {
		return function ({ complete, error, next }) {
			const unmounts = new Set<() => void>()
			let pulls: (() => void)[] = []
			let index: IO
			let done = false
			const { pull, unmount } = sources({
				complete() {
					done = true
					if (unmounts.size === 0) complete()
				},
				error,
				next(source) {
					const { pull, unmount } = source({
						complete() {
							unmount()
							unmounts.delete(unmount)
							if (unmounts.size === 0 && done) complete()
							pulls = pulls.filter((p) => p !== pull)
						},
						error,
						next(value) {
							next(value, index!)
						},
					})
					unmounts.add(unmount)
					if (pull) pulls.push(pull)
				},
			})
			return {
				pull: (pull
					? () => {
							const p0 = pulls[0]
							if (p0) {
								p0()
								return
							}
							pull()
						}
					: undefined) as any,
				result: noop,
				unmount() {
					unmounts.forEach(thrush)
					unmount()
				},
			}
		}
	}
}
