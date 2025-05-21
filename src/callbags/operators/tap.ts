import { AnyPullPush, Source } from '../sources'

export function tap<Value, Index, Err, R, P extends AnyPullPush>(
	cb: (value: Value, index: Index) => void,
) {
	return function (
		source: Source<Value, Index, Err, R, P>,
	): Source<Value, Index, Err, R, P> {
		return function (args) {
			return source({
				...args,
				next(value, index) {
					cb(value, index)
					args.next(value, index)
				},
			})
		}
	}
}
