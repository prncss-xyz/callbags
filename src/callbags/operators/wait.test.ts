import { flow } from '@constellar/core'
import { timed } from '@prncss-xyz/utils'
import { describe, expect, test } from 'vitest'

import { map } from '.'
import { collectAsync } from '../sinks'
import { pushIterable } from '../sources'
import { arrayFold, scan } from './scan'
import { wait } from './wait'

describe('wait', () => {
	test('collect last number', async () => {
		const res = await flow(
			pushIterable(Promise.resolve([9, 2, 0])),
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
