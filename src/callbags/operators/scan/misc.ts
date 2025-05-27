import { Fold } from './core'

export function fromEntries<T, Index extends PropertyKey>(): Fold<
	T,
	Record<Index, T>,
	Index
> {
	return {
		fold: (t, acc, index) => ({ ...acc, [index]: t }),
		foldDest: (t, acc, index) => ((acc[index] = t), acc),
		init: () => ({}) as any,
	}
}

export function sumFold<I>(): Fold<number, number, I> {
	return {
		fold: (t, acc) => acc + t,
		init: 0,
	}
}

export function productFold<I>(): Fold<number, number, I> {
	return {
		fold: (t, acc) => acc * t,
		init: 1,
	}
}

export function length<I>(): Fold<unknown, number, I> {
	return {
		fold: (_t, acc) => acc + 1,
		init: 0,
	}
}

export function groupBy<P extends PropertyKey, I, T>(
	keyFn: (t: T) => P | undefined,
): Fold<T, Record<P, T[]>, I> {
	return {
		fold: (t: T, groups) => {
			const key = keyFn(t)
			if (key !== undefined) {
				groups[key] ??= []
				groups[key].push(t)
			}
			return groups
		},
		init: () => ({}) as any,
	}
}

export function partition<T, I>(predicate: (t: T) => unknown) {
	return groupBy<'false' | 'true', I, T>((t: T) =>
		predicate(t) ? 'true' : 'false',
	)
}

export function join<I>(sep = '\t'): Fold<string, string, I> {
	return {
		fold: (t, acc) => (acc === '' ? t : acc + sep + t),
		init: '',
	}
}

export function joinLast<I>(sep = '\n'): Fold<string, string, I> {
	return {
		fold: (t, acc) => acc + t + sep,
		init: '',
	}
}
