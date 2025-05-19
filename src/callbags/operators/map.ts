import { Source } from '../sources'

export function map<A, B, Index>(cb: (value: A, index: Index) => B) {
	return function <Err, R>(
		source: Source<A, Index, Err, R>,
	): Source<B, Index, Err, R> {
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
