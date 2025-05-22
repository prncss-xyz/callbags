import { flow } from '@constellar/core'

import { collect, collectAsync } from '../sinks'
import { iterable } from '../sources'
import { concat } from './concat'
import { arrayFold, scan } from './scan'

describe('collect', () => {
	test('collect last number', () => {
		const res = flow(
			iterable([0, 1]),
			concat(iterable(['a', 'b'])),
			scan(arrayFold()),
			collect,
		)
		expect(res).toEqual([0, 1, 'a', 'b'])
		expectTypeOf(res).toEqualTypeOf<(number | string)[]>()
	})
	test('async', async () => {
		const res = await flow(
			iterable([0, 1]),
			concat(iterable(['a', 'b'])),
			scan(arrayFold()),
			collectAsync,
		)
		expect(res).toEqual([0, 1, 'a', 'b'])
		expectTypeOf(res).toEqualTypeOf<(number | string)[]>()
	})
})
