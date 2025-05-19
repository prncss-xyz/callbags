import { AnyPull, Source } from '../sources'

export function map<A, B, Index, P extends AnyPull>(
	cb: (value: A, index: Index) => B,
) {
	return function <Err, R>(
		source: Source<A, Index, Err, R, P>,
	): Source<B, Index, Err, R, P> {
		return function (args) {
			return source({
				...args,
				push(value, index) {
					args.push(cb(value, index), index)
				},
			})
		}
	}
}
