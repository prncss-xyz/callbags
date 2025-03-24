import { Source } from '../sources'

export function map<A, B, Index>(cb: (value: A, index: Index) => B) {
	return function <Init, Err, R>(
		source: Source<Init, A, Index, Err, R>,
	): Source<Init, B, Index, Err, R> {
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

export function mapAsync<A, B, Index>(
	cb: (value: A, index: Index) => Promise<B>,
) {
	return function <Init, Err, R>(
		source: Source<Init, A, Index, Err, R>,
	): Source<Init, B, Index, Err, R> {
		return function (args) {
			return source({
				...args,
				push(value, index) {
					cb(value, index).then((v) => args.push(v, index))
				},
			})
		}
	}
}
