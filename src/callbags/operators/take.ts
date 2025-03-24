import { Source } from '../sources'

// ?? is it really idempotent
export function take(n: number) {
	return function <Init, Value, Index, Err, R>(
		source: Source<Init, Value, Index, Err, R>,
	): Source<Init, Value, Index, Err, R> {
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
					else args.pass()
				},
			})
		}
	}
}
