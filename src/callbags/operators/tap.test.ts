import { flow } from '@constellar/core'

import { tap } from '.'
import { val } from '../sinks'
import { iterable } from '../sources'
import { fold, voidFold } from './scan'

describe('tap', () => {
	test('', () => {
		const cb = vi.fn()
		const res = flow(iterable([1, 2, 3]), tap(cb), fold(voidFold()), val())
		expect(cb.mock.calls).toEqual([
			[1, 0],
			[2, 1],
			[3, 2],
		])
		expectTypeOf(res).toEqualTypeOf<void>()
	})
})
