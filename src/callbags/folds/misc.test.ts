import { flow } from '@constellar/core'
import { describe, expect, test } from 'vitest'

import { collect } from '../sinks'
import { iterable } from '../sources'
import { scan } from './core'
import { joinFold, joinLastFold, objFold, productFold, sumFold } from './misc'

describe('sumFold', () => {
	test('', () => {
		const res = flow(iterable<number>(), scan(sumFold()), collect)([2, 3, 4])
		expect(res).toBe(9)
	})
})

describe('productFold', () => {
	test('', () => {
		const res = flow(
			iterable<number>(),
			scan(productFold()),
			collect,
		)([2, 3, 4])
		expect(res).toBe(24)
	})
})

describe('joinFold', () => {
	test('', () => {
		const res = flow(
			iterable<string>(),
			scan(joinFold(',')),
			collect,
		)(['a', 'b', 'c'])
		expect(res).toBe('a,b,c')
	})
})

describe('joinLastFold', () => {
	test('', () => {
		const res = flow(
			iterable<string>(),
			scan(joinLastFold(',')),
			collect,
		)(['a', 'b', 'c'])
		expect(res).toBe('a,b,c,')
	})
})

describe('objFold', () => {
	test('', () => {
		const res = flow(iterable<number>(), scan(objFold()), collect)([1, 2, 3])
		expect(res).toEqual({
			0: 1,
			1: 2,
			2: 3,
		})
	})
})
