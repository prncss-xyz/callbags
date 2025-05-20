import { noop } from '@constellar/core'

import { observe } from '../sinks'
import { Source } from '../sources'

function pendingCounter(onDone: () => void) {
	let completed = false
	let count = 0
	function after() {
		if (count === 0 && completed) {
			onDone()
		}
	}
	return {
		close() {
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

function toPush<Value, Index, Err>(
	source: Source<Value, Index, Err, void>,
): Source<Value, Index, Err, void> {
	return function ({ close, error, push }) {
		observe(source, {
			error,
			next: push,
		})
		close()
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

export function wait() {
	return function <A, Index, Err>(
		source: Source<Promise<A>, Index, Err, void>,
	): Source<A, Index, Err, void> {
		return function (args) {
			const { close, wrap } = pendingCounter(args.close)
			return toPush(source)({
				close,
				error: args.error,
				push(value, index) {
					wrap(value.then((v) => args.push(v, index)))
				},
			})
		}
	}
}
