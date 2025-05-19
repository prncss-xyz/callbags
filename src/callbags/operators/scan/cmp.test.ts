import { flow, shallowEqual } from '@constellar/core'

import { collect } from '../../sinks'
import { iterable } from '../../sources'
import { maxFold, minFold, shuffleFold, sortFold } from './cmp'
import { scan } from './core'

describe('maxFold', () => {
	test('empty', () => {
		const res = flow([], iterable, scan(maxFold()), collect)
		expect(res).toEqual(-Infinity)
	})
	test('defined', () => {
		const res = flow([0, 2, 1], iterable, scan(maxFold()), collect)
		expect(res).toEqual(2)
	})
})

describe('minFold', () => {
	test('empty', () => {
		const res = flow([], iterable, scan(minFold()), collect)
		expect(res).toEqual(+Infinity)
	})
	test('defined', () => {
		const res = flow([1, 0, 2], iterable, scan(minFold()), collect)
		expect(res).toEqual(0)
	})
})

describe('sortFold', () => {
	test('', () => {
		const res = flow([0, 2, 2, 1], iterable, scan(sortFold()), collect)
		expect(res).toEqual([0, 1, 2])
	})
})

describe('shuffleFold', () => {
	test('', () => {
		let res: number[]
		do {
			res = flow([0, 1, 2, 3], iterable, scan(shuffleFold()), collect)
		} while (shallowEqual(res, [0, 1, 2, 3]))
		expect(res).not.equal([0, 1, 2, 3])
		res.sort()
		expect(res).toEqual([0, 1, 2, 3])
	})
})
