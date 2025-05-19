import { Source } from '../sources'

export function take(n: number) {
	return function <Value, Index, Err, R>(
		source: Source<Value, Index, Err, R>,
	): Source<Value, Index, Err, R> {
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
