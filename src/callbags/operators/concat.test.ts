import { flow } from '@constellar/core'

import { collect, collectAsync, toPush } from '../sinks'
import { iterable } from '../sources'
import { concat } from './concat'
import { arrayFold, scan } from './scan'

describe('concat', () => {
	test('sync', () => {
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
			toPush(iterable([0, 1])),
			concat(toPush(iterable(['a', 'b']))),
			scan(arrayFold()),
			collectAsync,
		)
		expect(res).toEqual([0, 1, 'a', 'b'])
		expectTypeOf(res).toEqualTypeOf<(number | string)[]>()
	})
})
