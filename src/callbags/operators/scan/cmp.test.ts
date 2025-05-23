import { flow, shallowEqual } from '@constellar/core'

import { collect } from '../../sinks'
import { empty, toSource } from '../../sources'
import { maxFold, maxWithFold, minFold, shuffleFold, sortFold } from './cmp'
import { scan } from './core'

describe('maxWithFold', () => {
	test('empty', () => {
		const res = flow(
			empty<number>(),
			scan(maxWithFold((a, b) => a - b)),
			collect,
		)
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(
			toSource([0, 2, 1]),
			scan(maxWithFold((a, b) => a - b)),
			collect,
		)
		expect(res).toEqual(2)
	})
})

describe('maxFold', () => {
	test('empty', () => {
		const res = flow(empty<number>(), scan(maxFold()), collect)
		expect(res).toEqual(-Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([0, 2, 1]), scan(maxFold()), collect)
		expect(res).toEqual(2)
	})
})

describe('minFold', () => {
	test('empty', () => {
		const res = flow(empty<number>(), scan(minFold()), collect)
		expect(res).toEqual(+Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([1, 0, 2]), scan(minFold()), collect)
		expect(res).toEqual(0)
	})
})

describe('sortFold', () => {
	test('', () => {
		const res = flow(toSource([0, 2, 2, 1]), scan(sortFold()), collect)
		expect(res).toEqual([0, 1, 2])
	})
})

describe('shuffleFold', () => {
	test('', () => {
		let res: number[]
		do {
			res = flow(toSource([0, 1, 2, 3]), scan(shuffleFold()), collect)
		} while (shallowEqual(res, [0, 1, 2, 3]))
		expect(res).not.equal([0, 1, 2, 3])
		res.sort()
		expect(res).toEqual([0, 1, 2, 3])
	})
})
