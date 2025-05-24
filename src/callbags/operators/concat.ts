import { defer } from '../sinks'
import { AnyPullPush, Pull, Push, Source } from '../sources'

export function concat<V1, I1, E1, R1>(
	s2: Source<V1, I1, E1, R1, Pull>,
): <V2, I2, E2, R2>(
	s1: Source<V2, I2, E2, R2, Pull>,
) => Source<V1 | V2, I1 | I2, E1 | E2, R1 | R2, Pull>
export function concat<V1, I1, E1, R1>(
	s2: Source<V1, I1, E1, R1, Push>,
): <V2, I2, E2, R2>(
	s1: Source<V2, I2, E2, R2, Push>,
) => Source<V1 | V2, I1 | I2, E1 | E2, R1 | R2, Push>
export function concat<V1, I1, E1, R1, P extends AnyPullPush>(
	s2: Source<V1, I1, E1, R1, P>,
) {
	return function <V2, I2, E2, R2>(
		s1: Source<V2, I2, E2, R2, P>,
	): Source<V1 | V2, I1 | I2, E1 | E2, R1 | R2, P> {
		return function (props) {
			let ofS2: ReturnType<Source<V1, I1, E1, R1, P>>
			let pull: (() => void) | undefined
			let unmount: () => void
			const ofS1 = s1({
				complete() {
					if (unmount) unmount()
					else
						defer(() => {
							unmount()
						})
					ofS2 = s2(props)
					pull = ofS2.pull
					unmount = ofS2.unmount
				},
				error(e) {
					props.error(e)
				},
				next: props.next,
			})
			pull = ofS1.pull
			unmount = ofS1.unmount
			return {
				pull: (pull
					? () => {
							pull!()
						}
					: undefined) as any,
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
