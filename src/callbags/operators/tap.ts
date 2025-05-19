import { Source } from '../sources'

export function tap<Value, Index, Err, R>(
	cb: (value: Value, index: Index) => void,
) {
	return function (
		source: Source<Value, Index, Err, R>,
	): Source<Value, Index, Err, R> {
		return function (args) {
			return source({
				...args,
				push(value, index) {
					cb(value, index)
					args.push(value, index)
				},
			})
		}
	}
}
