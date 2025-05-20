import { isoAssert } from '@prncss-xyz/utils'

export function cmp0<T>(a: T, b: T): number {
	return a < b ? -1 : a > b ? 1 : 0
}

// TODO: use dichotomic search
export function sortedAdd<T>(cmp: (a: T, b: T) => number) {
	return function (t: T, acc: T[]): T[] {
		for (let i = 0; i < acc.length; i++) {
			const v = acc[i]
			isoAssert(v !== undefined)
			const r = cmp(v, t)
			if (r < 0) continue
			if (r === 0) return acc
			if (r > 0) return acc.slice(0, i).concat([t], acc.slice(i))
		}
		return acc.concat(t)
	}
}
