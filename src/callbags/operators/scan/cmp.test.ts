import { flow, shallowEqual } from '@constellar/core'

import { val } from '../../sinks'
import { empty, toSource } from '../../sources'
import { maxFold, maxWithFold, minFold, shuffleFold, sortFold } from './cmp'
import { fold } from './core'

describe('maxWithFold', () => {
	test('empty', () => {
		const res = flow(empty<number>(), fold(maxWithFold((a, b) => a - b)), val())
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(
			toSource([0, 2, 1]),
			fold(maxWithFold((a, b) => a - b)),
			val(),
		)
		expect(res).toEqual(2)
	})
})

describe('maxFold', () => {
	test('empty', () => {
		const res = flow(empty<number>(), fold(maxFold()), val())
		expect(res).toEqual(-Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([0, 2, 1]), fold(maxFold()), val())
		expect(res).toEqual(2)
	})
})

describe('minFold', () => {
	test('empty', () => {
		const res = flow(empty<number>(), fold(minFold()), val())
		expect(res).toEqual(+Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([1, 0, 2]), fold(minFold()), val())
		expect(res).toEqual(0)
	})
})

describe('sortFold', () => {
	test('', () => {
		const res = flow(toSource([0, 2, 2, 1]), fold(sortFold()), val())
		expect(res).toEqual([0, 1, 2])
	})
})

describe('shuffleFold', () => {
	test('', () => {
		let res: number[]
		do {
			res = flow(toSource([0, 1, 2, 3]), fold(shuffleFold()), val())
		} while (shallowEqual(res, [0, 1, 2, 3]))
		expect(res).not.equal([0, 1, 2, 3])
		res.sort((a, b) => a - b)
		expect(res).toEqual([0, 1, 2, 3])
	})
})
