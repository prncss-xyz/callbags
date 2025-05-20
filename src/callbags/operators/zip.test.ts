import { flow } from '@constellar/core'

import { collect, collectAsync } from '../sinks'
import { iterable } from '../sources'
import { arrayFold, scan } from './scan'
import { zip } from './zip'

describe('collect', () => {
	test('collect last number', () => {
		const res = flow(
			iterable([0, 1]),
			zip(iterable(['a', 'b']), (a, b) => a + b),
			scan(arrayFold()),
			collect,
		)
		expect(res).toEqual(['0a', '1b'])
		expectTypeOf(res).toEqualTypeOf<string[]>()
	})
})
