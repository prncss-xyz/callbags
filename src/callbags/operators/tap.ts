import { Source } from '../sources'

export function tap<Init, Value, Index, Err, R>(
	cb: (value: Value, index: Index) => void,
) {
	return function (
		source: Source<Init, Value, Index, Err, R>,
	): Source<Init, Value, Index, Err, R> {
		return function (args) {
			return source({
				...args,
				push(value, index) {
					cb(value, index)
					args.push(value, index)
					args.pass()
				},
			})
		}
	}
}
