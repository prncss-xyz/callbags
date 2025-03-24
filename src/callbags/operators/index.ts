import { Source } from '../sources'

export * from './flatten'
export * from './map'
export * from './take'
export * from './tap'

export function _identity<Init, Value, Index, Err, R>() {
	return function (
		source: Source<Init, Value, Index, Err, R>,
	): Source<Init, Value, Index, Err, R> {
		return function (args) {
			return source(args)
		}
	}
}
