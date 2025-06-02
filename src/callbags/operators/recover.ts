import { DomainError } from '../../errors'
import { AnyPullPush, Source } from '../sources'

// TODO:
export function recover<
	Err extends DomainError,
	B extends DomainError,
	P extends AnyPullPush,
>(cb: (value: Err) => B) {
	return function <A, Index, R>(
		source: Source<A, Index, Err, R, P>,
	): Source<A, Index, B, R, P> {
		return function (props) {
			return source({
				...props,
				error(value) {
					props.error(cb(value))
				},
			})
		}
	}
}
