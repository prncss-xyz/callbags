import { flow, shallowEqual } from '@constellar/core'

import { collect } from '../../sinks'
import { empty, toSource } from '../../sources'
import { maxFold, maxWithFold, minFold, shuffleFold, sortFold } from './cmp'

describe('maxWithFold', () => {
	test('empty', () => {
		const res = flow(empty<number>(), collect(maxWithFold((a, b) => a - b)))
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(
			toSource([0, 2, 1]),
			collect(maxWithFold((a, b) => a - b)),
		)
		expect(res).toEqual(2)
	})
})

describe('maxFold', () => {
	test('empty', () => {
		const res = flow(empty<number>(), collect(maxFold()))
		expect(res).toEqual(-Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([0, 2, 1]), collect(maxFold()))
		expect(res).toEqual(2)
	})
})

describe('minFold', () => {
	test('empty', () => {
		const res = flow(empty<number>(), collect(minFold()))
		expect(res).toEqual(+Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([1, 0, 2]), collect(minFold()))
		expect(res).toEqual(0)
	})
})

describe('sortFold', () => {
	test('', () => {
		const res = flow(toSource([0, 2, 2, 1]), collect(sortFold()))
		expect(res).toEqual([0, 1, 2])
	})
})

describe('shuffleFold', () => {
	test('', () => {
		let res: number[]
		do {
			res = flow(toSource([0, 1, 2, 3]), collect(shuffleFold()))
		} while (shallowEqual(res, [0, 1, 2, 3]))
		expect(res).not.equal([0, 1, 2, 3])
		res.sort((a, b) => a - b)
		expect(res).toEqual([0, 1, 2, 3])
	})
})
