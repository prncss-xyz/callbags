import { noop } from '@constellar/core'

import { AnyPullPush, Source } from '../sources'

function merger<A, B, C, I>(
	f: (a: A, b: B, i: I) => C,
	pushC: (c: C, i: I) => void,
	completeC: () => void,
) {
	let openedA = true
	let openedB = true
	const as: A[] = []
	const is: I[] = []
	const bs: B[] = []
	return {
		completeA() {
			if (openedB) {
				openedA = false
				return
			}
			completeC()
		},
		completeB() {
			if (openedA) {
				openedB = false
				return
			}
			completeC()
		},
		nextA(a: A, i: I) {
			if (!openedA) return
			if (bs.length) {
				const b = bs.shift()!
				pushC(f(a, b, i), i)
				if (!bs.length && !openedB) completeC()
				return
			}
			as.push(a)
			is.push(i)
		},
		nextB(b: B) {
			if (!openedB) return
			if (as.length) {
				const a = as.shift()!
				const i = is.shift()!
				pushC(f(a, b, i), i)
				if (!as.length && !openedA) completeC()
				return
			}
			bs.push(b)
		},
	}
}

export function zip<VB, IB, EB, RB, C, VA, P extends AnyPullPush>(
	sb: Source<VB, IB, EB, RB, P>,
	f: (a: VA, b: VB) => C,
) {
	return function <IA, EA, RA>(
		sa: Source<VA, IA, EA, RA, P>,
	): Source<C, IA, EA | EB, void, P> {
		return function ({ complete, error, next }) {
			const { completeA, completeB, nextA, nextB } = merger(f, next, complete)
			const ofS1 = sa({ complete: completeA, error, next: nextA })
			const ofS2 = sb({ complete: completeB, error, next: nextB })
			return {
				pull: (ofS1.pull || ofS2.pull
					? () => {
							ofS1.pull?.()
							ofS2.pull?.()
						}
					: undefined) as any,
				result: noop,
				unmount() {
					ofS1.unmount()
					ofS2.unmount()
				},
			}
		}
	}
}
