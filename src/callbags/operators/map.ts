import { DomainError } from '../../errors'
import { AnyPullPush, Source } from '../sources'

export function map<A, B, Index, P extends AnyPullPush>(
	cb: (value: A, index: Index) => B,
) {
	return function <Err extends DomainError, R>(
		source: Source<A, Index, Err, R, P>,
	): Source<B, Index, Err, R, P> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					props.next(cb(value, index), index)
				},
			})
		}
	}
}
