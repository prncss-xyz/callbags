import { noop } from '@constellar/core'

import { observe } from '../sinks'
import { Source } from '../sources'

export function toPush() {
	return function <Value, Index, Err>(
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
}
