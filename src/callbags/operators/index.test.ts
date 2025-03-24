import { flow } from '@constellar/core'
import { describe, expect, expectTypeOf, test, vi } from 'vitest'

import { tap } from '.'
import { collect } from '../sinks'
import { iterable } from '../sources'

describe('tap', () => {
	test('', () => {
		const cb = vi.fn()
		const res = flow(iterable<number>(), tap(cb), collect)([1, 2, 3])
		expect(cb.mock.calls).toEqual([
			[1, 0],
			[2, 1],
			[3, 2],
		])
		expectTypeOf(res).toEqualTypeOf<void>()
	})
})
