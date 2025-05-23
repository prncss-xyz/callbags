import { flow } from '@constellar/core'

import { tap } from '.'
import { collect } from '../sinks'
import { iterable } from '../sources'

describe('tap', () => {
	test('', () => {
		const cb = vi.fn()
		const res = flow(iterable([1, 2, 3]), tap(cb), collect)
		expect(cb.mock.calls).toEqual([
			[1, 0],
			[2, 1],
			[3, 2],
		])
		expectTypeOf(res).toEqualTypeOf<void>()
	})
})
