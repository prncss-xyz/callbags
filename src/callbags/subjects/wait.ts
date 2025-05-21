import { noop } from '@constellar/core'

import { observe } from '../sinks'
import { AnyPullPush, Push, Source } from '../sources'

export function toPush<Value, Index, Err, P extends AnyPullPush>(
	source: Source<Value, Index, Err, void, P>,
): Source<Value, Index, Err, void, Push> {
	return function ({ complete, error, next }) {
		setTimeout(() => {
			observe(source, {
				error,
				next,
			})
			complete()
		}, 0)
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

function toPush0<Value, Index, Err, P extends AnyPullPush>(
	source: Source<Value, Index, Err, void, P>,
): Source<Value, Index, Err, void, Push> {
	return function ({ complete, error, next }) {
		observe(source, {
			error,
			next,
		})
		complete()
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

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
	return function <A, Index, Err, P extends AnyPullPush>(
		source: Source<Promise<A>, Index, Err, void, P>,
	): Source<A, Index, Err, void, Push> {
		return function (args) {
			const { complete, wrap } = pendingCounter(args.complete)
			return toPush0(source)({
				complete,
				error: args.error,
				next(value, index) {
					wrap(value.then((v) => args.next(v, index)))
				},
			})
		}
	}
}
