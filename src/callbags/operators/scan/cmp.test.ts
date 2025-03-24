import { flow, shallowEqual } from '@constellar/core'
import { describe, expect, test } from 'vitest'

import { collect } from '../../sinks'
import { iterable } from '../../sources'
import { maxFold, minFold, shuffleFold, sortFold } from './cmp'
import { scan } from './core'

describe('maxFold', () => {
	test('empty', () => {
		const res = flow(iterable<number>(), scan(maxFold()), collect)([])
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(iterable<number>(), scan(maxFold()), collect)([0, 2, 1])
		expect(res).toEqual(2)
	})
})

describe('minFold', () => {
	test('empty', () => {
		const res = flow(iterable<number>(), scan(minFold()), collect)([])
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(iterable<number>(), scan(minFold()), collect)([1, 0, 2])
		expect(res).toEqual(0)
	})
})

describe('sortFold', () => {
	test('', () => {
		const res = flow(
			iterable<number>(),
			scan(sortFold()),
			collect,
		)([0, 2, 2, 1])
		expect(res).toEqual([0, 1, 2])
	})
})

describe('shuffleFold', () => {
	test('', () => {
		let res: number[]
		do {
			res = flow(iterable<number>(), scan(shuffleFold()), collect)([0, 1, 2, 3])
		} while (shallowEqual(res, [0, 1, 2, 3]))
		expect(res).not.equal([0, 1, 2, 3])
		res.sort()
		expect(res).toEqual([0, 1, 2, 3])
	})
})
