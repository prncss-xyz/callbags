import { flow } from '@constellar/core'

import { value } from '../../unions/value'
import { extract, toPush } from '../sinks/observe'
import { iterable } from '../sources/basics'
import { concat } from './concat'
import { collect, fold } from './scan/core'

describe('concat', () => {
	test('sync', () => {
		const res = flow(
			iterable([0, 1]),
			concat(iterable(['a', 'b'])),
			fold(collect()),
			extract(value()),
		)
		expect(res).toEqual([0, 1, 'a', 'b'])
		expectTypeOf(res).toEqualTypeOf<(number | string)[]>()
	})
	test('async', async () => {
		const res = await flow(
			toPush(iterable([0, 1])),
			concat(toPush(iterable(['a', 'b']))),
			fold(collect()),
			extract(value()),
		)
		expect(res).toEqual([0, 1, 'a', 'b'])
		expectTypeOf(res).toEqualTypeOf<(number | string)[]>()
	})
})
