import { AnyPullPush, Source } from '../sources'

export function take(n: number) {
	return function <Value, Index, Err, R, P extends AnyPullPush>(
		source: Source<Value, Index, Err, R, P>,
	): Source<Value, Index, Err, R, P> {
		return function (args) {
			let count = 0
			return source({
				...args,
				next(value, index) {
					if (n === 0) {
						args.complete()
						return
					}
					count++
					args.next(value, index)
					if (count === n) args.complete()
				},
			})
		}
	}
}
