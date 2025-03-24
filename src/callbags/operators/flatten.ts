import { Source } from '../sources'

export function flatten<Init, Value, Index, Err, R>() {
	return function (
		source: Source<Init, Value, Index, Err, R>,
	): Source<Init, Value, Index, Err, R> {
		return function (args) {
			// TODO:
			return source(args)
		}
	}
}
