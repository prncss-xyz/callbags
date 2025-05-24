import { Push, Source } from '../sources'

function pendingCounter(onDone: () => void) {
	let completed = false
	let count = 0
	function after() {
		if (count === 0 && completed) {
			onDone()
		}
	}
	return {
		complete() {
			completed = true
			after()
		},
		async wrap(p: Promise<unknown>) {
			count++
			try {
				await p
			} finally {
				count--
				after()
			}
		},
	}
}

export function wait() {
	return function <A, Index, Err>(
		source: Source<Promise<A>, Index, Err, void, Push>,
	): Source<A, Index, Err, void, Push> {
		return function (props) {
			const { complete, wrap } = pendingCounter(props.complete)
			return source({
				complete,
				error: props.error,
				next(value, index) {
					wrap(value.then((v) => props.next(v, index)))
				},
			})
		}
	}
}
