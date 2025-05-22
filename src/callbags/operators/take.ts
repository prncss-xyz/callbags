import { AnyPullPush, Source } from '../sources'

export function take(n: number) {
	return function <Value, Index, Err, R, P extends AnyPullPush>(
		source: Source<Value, Index, Err, R, P>,
	): Source<Value, Index, Err, R, P> {
		return function (props) {
			let count = 0
			return source({
				...props,
				next(value, index) {
					if (n === 0) {
						props.complete()
						return
					}
					count++
					props.next(value, index)
					if (count === n) props.complete()
				},
			})
		}
	}
}
