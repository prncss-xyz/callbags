import { noop } from '@constellar/core'

import { observe } from '../sinks'
import { Pull, Push, Source } from '../sources'

export function toPush<Value, Index, Err>(
	source: Source<Value, Index, Err, void, Pull>,
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
