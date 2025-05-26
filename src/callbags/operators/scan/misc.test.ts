import { flow } from '@constellar/core'

import { val } from '../../sinks'
import { iterable } from '../../sources'
import { fold } from './core'
import { joinFold, joinLastFold, objFold, productFold, sumFold } from './misc'

describe('sumFold', () => {
	test('', () => {
		const res = flow(iterable([2, 3, 4]), fold(sumFold()), val())
		expect(res).toBe(9)
	})
})

describe('productFold', () => {
	test('', () => {
		const res = flow(iterable([2, 3, 4]), fold(productFold()), val())
		expect(res).toBe(24)
	})
})

describe('joinFold', () => {
	test('', () => {
		const res = flow(iterable(['a', 'b', 'c']), fold(joinFold(',')), val())
		expect(res).toBe('a,b,c')
	})
})

describe('joinLastFold', () => {
	test('', () => {
		const res = flow(iterable(['a', 'b', 'c']), fold(joinLastFold(',')), val())
		expect(res).toBe('a,b,c,')
	})
})

describe('objFold', () => {
	test('', () => {
		const res = flow(iterable([1, 2, 3]), fold(objFold()), val())
		expect(res).toEqual({
			0: 1,
			1: 2,
			2: 3,
		})
	})
})
