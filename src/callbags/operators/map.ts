import { AnyPullPush, Source } from '../sources'

export function map<A, B, Index, P extends AnyPullPush>(
	cb: (value: A, index: Index) => B,
) {
	return function <Err, R>(
		source: Source<A, Index, Err, R, P>,
	): Source<B, Index, Err, R, P> {
		return function (args) {
			return source({
				...args,
				next(value, index) {
					args.next(cb(value, index), index)
				},
			})
		}
	}
}
