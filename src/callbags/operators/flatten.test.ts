import { flow } from '@constellar/core'
import { describe, expect, test } from 'vitest'

import { flatten } from '../operators'
import { arrayFold } from '../operators/scan'
import { collect } from '../sinks'
import { iterable } from '../sources'

describe('flatten', () => {
	test('collect last number', async () => {
		const res = flow(
			iterable([iterable([0, 1]), iterable([2, 3])]),
			flatten(),
			collect(arrayFold()),
		)
		expect(res).toEqual([0, 1, 2, 3])
	})
})
