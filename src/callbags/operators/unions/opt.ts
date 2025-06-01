import { id } from '@constellar/core'
import { always } from '@prncss-xyz/utils'

import { empty, Empty } from './empty'

export const opt = {
	onError: always(undefined),
	onSuccess: id,
	shift<S>(
		value: null | S | undefined,
		onSuccess: (s: NonNullable<S>) => void,
		onError: (e: Empty) => void,
	) {
		if (value === undefined || value === null) onError(empty)
		else onSuccess(value)
	},
}
