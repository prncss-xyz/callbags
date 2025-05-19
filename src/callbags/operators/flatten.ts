import { noop } from '@constellar/core'
import { thrush } from '@prncss-xyz/utils'

import { Source } from '../sources'

export function flatten<Value, IO, EO, RO, II, EI, RI>() {
	return function (
		sources: Source<Source<Value, II, EI, RI>, IO, EO, RO>,
	): Source<Value, IO, EI | EO, void> {
		return function ({ close, error, push }) {
			const unmounts = new Set<() => void>()
			let pulls: (() => void)[] = []
			let index: IO
			let done = false
			const { pull, unmount } = sources({
				close() {
					done = true
					if (unmounts.size === 0) close()
				},
				error,
				push(source) {
					const { pull, unmount } = source({
						close() {
							unmount()
							unmounts.delete(unmount)
							if (unmounts.size === 0 && done) close()
							pulls = pulls.filter((p) => p !== pull)
						},
						error,
						push(value) {
							push(value, index!)
						},
					})
					unmounts.add(unmount)
					if (pull) pulls.push(pull)
				},
			})
			return {
				pull() {
					const p0 = pulls[0]
					if (p0) {
						p0()
						return
					}
					pull?.()
				},
				result: noop,
				unmount() {
					unmounts.forEach(thrush)
					unmount()
				},
			}
		}
	}
}
