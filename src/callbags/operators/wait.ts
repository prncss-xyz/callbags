import { Source } from '../sources'
import { pendingCounter } from './_internals'

export function wait<A, Index>() {
	return function <Err, R>(
		source: Source<Promise<A>, Index, Err, R>,
	): Source<A, Index, Err, R> {
		return function (args) {
			const { close, wrap } = pendingCounter(args.close)
			return source({
				...args,
				close,
				push(value, index) {
					wrap(value.then((v) => args.push(v, index)))
				},
			})
		}
	}
}
