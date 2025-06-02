import { id } from '@constellar/core'
import { always } from '@prncss-xyz/utils'

import { EmptyError } from '../errors'

export function opt<S, E>() {
	return {
		onError: always(undefined) as (e: E) => undefined,
		onSuccess: id<S>,
		shift(
			value: null | S | undefined,
			onSuccess: (s: NonNullable<S>) => void,
			onError: (e: unknown) => void,
		) {
			if (value === undefined || value === null) onError(new EmptyError())
			else onSuccess(value)
		},
	}
}
