import { flow } from '@constellar/core'
import { mul } from '@prncss-xyz/utils'
import { describe, expect, expectTypeOf, test } from 'vitest'

import { scan, valueFold } from './folds'
import { map, take } from './operators'
import { collect, collectAsync } from './sinks'
import { interval, iterable } from './sources'

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

describe('map', () => {
	test('changes type', () => {
		const res = flow(
			iterable<number>(),
			map(mul(2)),
			map(String),
			map((x, i) => x + i),
			scan(valueFold()),
			collect,
		)([1, 2, 3, 4])
		expect(res).toEqual('83')
		expectTypeOf(res).toEqualTypeOf<string | undefined>()
	})
})

describe('take', () => {
	test('undefined', () => {
		const res = flow(
			iterable<number>(),
			take(0),
			scan(valueFold()),
			collect,
		)([1, 2, 3, 4])
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(
			iterable<number>(),
			take(2),
			scan(valueFold()),
			collect,
		)([1, 2, 3, 4])
		expect(res).toBe(2)
	})
	test('idempotency', () => {
		const res = flow(iterable<number>(), take(2), scan(valueFold()), collect)
		expect(res([1, 2, 3, 4])).toEqual(2)
		expect(res([1, 2, 3, 4])).toEqual(2)
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
