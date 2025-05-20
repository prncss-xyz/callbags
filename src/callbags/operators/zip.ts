import { noop } from '@constellar/core'

import { AnyPullPush, Source } from '../sources'

function merger<A, B, C, I>(
	f: (a: A, b: B, i: I) => C,
	pushC: (c: C, i: I) => void,
) {
	const as: A[] = []
	const is: I[] = []
	const bs: B[] = []
	return {
		pushA(a: A, i: I) {
			if (bs.length) {
				const b = bs.pop()!
				pushC(f(a, b, i), i)
				return
			}
			as.push(a)
			is.push(i)
		},
		pushB(b: B) {
			if (as.length) {
				const a = as.pop()!
				const i = is.pop()!
				pushC(f(a, b, i), i)
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
		return function ({ close, error, push }) {
			const { pushA, pushB } = merger(f, push)
			const ofS1 = sa({ close, error, push: pushA })
			const ofS2 = sb({ close, error, push: pushB })
			return {
				pull: (ofS1.pull && ofS2.pull
					? () => {
							ofS1.pull!()
							ofS2.pull!()
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
