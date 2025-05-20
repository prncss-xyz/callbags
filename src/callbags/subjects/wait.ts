import { noop } from '@constellar/core'

import { observe } from '../sinks'
import { AnyPullPush, Push, Source } from '../sources'

export function toPush<Value, Index, Err, P extends AnyPullPush>(
	source: Source<Value, Index, Err, void, P>,
): Source<Value, Index, Err, void, Push> {
	return function ({ close, error, push }) {
		setTimeout(() => {
			observe(source, {
				error,
				next: push,
			})
			close()
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

export function wait() {
	return function <A, Index, Err, P extends AnyPullPush>(
		source: Source<Promise<A>, Index, Err, void, P>,
	): Source<A, Index, Err, void, Push> {
		return function (args) {
			const { close, wrap } = pendingCounter(args.close)
			return toPush0(source)({
				close,
				error: args.error,
				push(value, index) {
					wrap(value.then((v) => args.push(v, index)))
				},
			})
		}
	}
}
