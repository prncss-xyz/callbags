import { Source } from '../sources'

export function _identity<Value, Index, Err, R>() {
	return function (
		source: Source<Value, Index, Err, R>,
	): Source<Value, Index, Err, R> {
		return function (args) {
			return source(args)
		}
	}
}
