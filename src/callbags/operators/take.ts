import { AnyPullPush, Source } from '../sources'

export function take(n: number) {
	return function <Value, Index, Err, R, P extends AnyPullPush>(
		source: Source<Value, Index, Err, R, P>,
	): Source<Value, Index, Err, R, P> {
		return function (args) {
			let count = 0
			return source({
				...args,
				push(value, index) {
					if (n === 0) {
						args.close()
						return
					}
					count++
					args.push(value, index)
					if (count === n) args.close()
				},
			})
		}
	}
}
