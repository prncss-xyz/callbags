import { flow } from '@constellar/core'

import { value } from '../../../unions/value'
import { extract } from '../../sinks/observe'
import { iterable } from '../../sources/basics'
import { fold } from './core'
import { fromEntries, join, joinLast, productFold, sumFold } from './misc'

describe('sumFold', () => {
	test('', () => {
		const res = flow(iterable([2, 3, 4]), fold(sumFold()), extract(value()))
		expect(res).toBe(9)
	})
})

describe('productFold', () => {
	test('', () => {
		const res = flow(iterable([2, 3, 4]), fold(productFold()), extract(value()))
		expect(res).toBe(24)
	})
})

describe('join', () => {
	test('', () => {
		const res = flow(
			iterable(['a', 'b', 'c']),
			fold(join(',')),
			extract(value()),
		)
		expect(res).toBe('a,b,c')
	})
})

describe('joinLast', () => {
	test('', () => {
		const res = flow(
			iterable(['a', 'b', 'c']),
			fold(joinLast(',')),
			extract(value()),
		)
		expect(res).toBe('a,b,c,')
	})
})

describe('fromEntries', () => {
	test('', () => {
		const res = flow(iterable([1, 2, 3]), fold(fromEntries()), extract(value()))
		expect(res).toEqual({
			0: 1,
			1: 2,
			2: 3,
		})
	})
})
