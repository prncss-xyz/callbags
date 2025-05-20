import { flow } from '@constellar/core'
import { timed } from '@prncss-xyz/utils'
import { describe, expect, test } from 'vitest'

import { map } from '../operators'
import { arrayFold, scan } from '../operators/scan'
import { collectAsync } from '../sinks'
import { iterable } from '../sources'
import { wait } from './wait'

describe('wait', () => {
	test('', async () => {
		const res = await flow(
			iterable([9, 2, 0]),
			map(async (v) => {
				await timed(v * 10)
				return v
			}),
			wait(),
			scan(arrayFold()),
			collectAsync,
		)
		expect(res).toEqual([0, 2, 9])
	})
})
