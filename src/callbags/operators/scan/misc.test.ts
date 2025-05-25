import { flow } from '@constellar/core'

import { collect } from '../../sinks'
import { iterable } from '../../sources'
import { joinFold, joinLastFold, objFold, productFold, sumFold } from './misc'

describe('sumFold', () => {
	test('', () => {
		const res = flow(iterable([2, 3, 4]), collect(sumFold()))
		expect(res).toBe(9)
	})
})

describe('productFold', () => {
	test('', () => {
		const res = flow(iterable([2, 3, 4]), collect(productFold()))
		expect(res).toBe(24)
	})
})

describe('joinFold', () => {
	test('', () => {
		const res = flow(iterable(['a', 'b', 'c']), collect(joinFold(',')))
		expect(res).toBe('a,b,c')
	})
})

describe('joinLastFold', () => {
	test('', () => {
		const res = flow(iterable(['a', 'b', 'c']), collect(joinLastFold(',')))
		expect(res).toBe('a,b,c,')
	})
})

describe('objFold', () => {
	test('', () => {
		const res = flow(iterable([1, 2, 3]), collect(objFold()))
		expect(res).toEqual({
			0: 1,
			1: 2,
			2: 3,
		})
	})
})
