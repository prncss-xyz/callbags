import { flow, shallowEqual } from '@constellar/core'

import { val } from '../../sinks'
import { empty, toSource } from '../../sources'
import { max, maxWith, min, shuffle, sort } from './cmp'
import { fold } from './core'

describe('maxWith', () => {
	test('empty', () => {
		const res = flow(empty<number>(), fold(maxWith((a, b) => a - b)), val())
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(toSource([0, 2, 1]), fold(maxWith((a, b) => a - b)), val())
		expect(res).toEqual(2)
	})
})

describe('max', () => {
	test('empty', () => {
		const res = flow(empty<number>(), fold(max()), val())
		expect(res).toEqual(-Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([0, 2, 1]), fold(max()), val())
		expect(res).toEqual(2)
	})
})

describe('min', () => {
	test('empty', () => {
		const res = flow(empty<number>(), fold(min()), val())
		expect(res).toEqual(+Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([1, 0, 2]), fold(min()), val())
		expect(res).toEqual(0)
	})
})

describe('sort', () => {
	test('', () => {
		const res = flow(toSource([0, 2, 2, 1]), fold(sort()), val())
		expect(res).toEqual([0, 1, 2])
	})
})

describe('shuffle', () => {
	test('', () => {
		let res: number[]
		do {
			res = flow(toSource([0, 1, 2, 3]), fold(shuffle()), val())
		} while (shallowEqual(res, [0, 1, 2, 3]))
		expect(res).not.equal([0, 1, 2, 3])
		res.sort((a, b) => a - b)
		expect(res).toEqual([0, 1, 2, 3])
	})
})
