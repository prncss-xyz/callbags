import { flow } from '@constellar/core'

import { value } from '../../unions/value'
import { extract } from '../sinks/observe'
import { iterable } from '../sources/basics'
import { fold, last } from './scan/core'
import { tap } from './tap'

describe('tap', () => {
	test('', () => {
		const cb = vi.fn()
		flow(iterable([1, 2, 3]), tap(cb), fold(last()), extract(value()))
		expect(cb.mock.calls).toEqual([
			[1, 0],
			[2, 1],
			[3, 2],
		])
	})
})
