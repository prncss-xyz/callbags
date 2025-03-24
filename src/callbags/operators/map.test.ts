import { flow } from '@constellar/core'
import { mul } from '@prncss-xyz/utils'
import { describe, expect, expectTypeOf, test } from 'vitest'

import { collect } from '../sinks'
import { iterable } from '../sources'
import { map } from './map'
import { scan, valueFold } from './scan'

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
