import { Source } from '../sources'

export function concat<V1, I1, E1, R1>(s2: Source<V1, I1, E1, R1>) {
	return function <V2, I2, E2, R2>(
		s1: Source<V2, I2, E2, R2>,
	): Source<V1 | V2, I1 | I2, E1 | E2, R1 | R2> {
		return function (args) {
			let ofS2: ReturnType<Source<V1, I1, E1, R1>>
			let pull: (() => void) | undefined
			let unmount: () => void
			const ofS1 = s1({
				close() {
					unmount()
					ofS2 = s2(args)
					pull = ofS2.pull
					unmount = ofS2.unmount
				},
				error(e) {
					args.error(e)
				},
				push: args.push,
			})
			pull = ofS1.pull
			unmount = ofS1.unmount
			return {
				pull() {
					pull?.()
				},
				result() {
					return ofS2.result()
				},
				unmount() {
					unmount()
				},
			}
		}
	}
}
