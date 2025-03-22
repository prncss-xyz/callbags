import { insert } from '@constellar/core'

import { Fold } from './core'
import { cmp0, sortedAdd } from './internal'

export function maxFold<T, I>(cmp = cmp0<T>): Fold<T, T | undefined, I> {
	return {
		fold: (t, acc) => (acc === undefined || cmp(t, acc) > 0 ? t : acc),
		init: undefined,
	}
}

export function minFold<T, I>(cmp = cmp0<T>): Fold<T, T | undefined, I> {
	return {
		fold: (t, acc) => (acc === undefined || cmp(t, acc) < 0 ? t : acc),
		init: undefined,
	}
}

export function sortFold<T, I>(cmp = cmp0<T>): Fold<T, T[], I> {
	return {
		fold: sortedAdd(cmp),
		init: () => [] as T[],
	}
}

export function shuffleFold<T, I>(): Fold<T, T[], I> {
	return {
		fold(t, acc) {
			const i = Math.floor(Math.random() * (acc.length + 1))
			return insert(i, t, acc)
		},
		init: () => [] as any,
	}
}
