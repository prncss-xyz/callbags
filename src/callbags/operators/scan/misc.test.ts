import { flow } from '@constellar/core'

import { collect } from '../../sinks'
import { iterable } from '../../sources'
import { scan } from './core'
import { joinFold, joinLastFold, objFold, productFold, sumFold } from './misc'

describe('sumFold', () => {
	test('', () => {
		const res = flow([2, 3, 4], iterable, scan(sumFold()), collect)
		expect(res).toBe(9)
	})
})

describe('productFold', () => {
	test('', () => {
		const res = flow([2, 3, 4], iterable<number>, scan(productFold()), collect)
		expect(res).toBe(24)
	})
})

describe('joinFold', () => {
	test('', () => {
		const res = flow(['a', 'b', 'c'], iterable, scan(joinFold(',')), collect)
		expect(res).toBe('a,b,c')
	})
})

describe('joinLastFold', () => {
	test('', () => {
		const res = flow(
			['a', 'b', 'c'],
			iterable,
			scan(joinLastFold(',')),
			collect,
		)
		expect(res).toBe('a,b,c,')
	})
})

describe('objFold', () => {
	test('', () => {
		const res = flow([1, 2, 3], iterable, scan(objFold()), collect)
		expect(res).toEqual({
			0: 1,
			1: 2,
			2: 3,
		})
	})
})
