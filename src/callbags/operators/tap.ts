import { DomainError } from '../../errors'
import { AnyPullPush, Source } from '../sources'

export function tap<
	Value,
	Index,
	Err extends DomainError,
	R,
	P extends AnyPullPush,
>(cb: (value: Value, index: Index) => void) {
	return function (
		source: Source<Value, Index, Err, R, P>,
	): Source<Value, Index, Err, R, P> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					cb(value, index)
					props.next(value, index)
				},
			})
		}
	}
}
