import { flow } from '@constellar/core'
import { mul } from '@prncss-xyz/utils'

import { collect } from '../sinks'
import { iterable } from '../sources'
import { map } from './map'
import { scan, valueFold } from './scan'

describe('map', () => {
	test('changes type', () => {
		const res = flow(
			iterable([1, 2, 3, 4]),
			map(mul(2)),
			map(String),
			map((x, i) => x + i),
			scan(valueFold()),
			collect,
		)
		expect(res).toEqual('83')
		expectTypeOf(res).toEqualTypeOf<string | undefined>()
	})
})
