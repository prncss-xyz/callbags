import { flow } from '@constellar/core'
import { describe, expect, expectTypeOf, test } from 'vitest'

import { take } from '../operators'
import { scan, valueFold } from '../operators/scan'
import { interval, iterable } from '../sources'
import { collect, collectAsync } from './observe'

describe('collect', () => {
	test('collect last number', () => {
		const res = flow(
			iterable<number>(),
			scan(valueFold()),
			collect,
		)([1, 2, 3, 4])
		expect(res).toEqual(4)
		expectTypeOf(res).toEqualTypeOf<number | undefined>()
	})
})

describe('collectAsync', () => {
	test('undefined', async () => {
		const res = await flow(
			iterable<number>(),
			take(0),
			scan(valueFold()),
			collectAsync,
		)([1, 2, 3, 4])
		expectTypeOf(res).toEqualTypeOf<number | undefined>()
		expect(res).toEqual(undefined)
	})
	test('defined', async () => {
		const res = await flow(
			iterable<number>(),
			take(2),
			scan(valueFold()),
			collectAsync,
		)([1, 2, 3, 4])
		expect(res).toEqual(2)
	})
	test('interval', async () => {
		const res = await flow(
			interval(1),
			take(4),
			scan(valueFold()),
			collectAsync,
		)()
		expect(res).toEqual(3)
	})
})
