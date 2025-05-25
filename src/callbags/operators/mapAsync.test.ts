import { flow, id } from '@constellar/core'
import { timed } from '@prncss-xyz/utils'
import { describe, expect, test } from 'vitest'

import { map } from '.'
import { collectAsync, toPush } from '../sinks'
import { iterable } from '../sources'
import { mapAsync } from './mapAsync'
import { arrayFold } from './scan'

describe('mapAsync', () => {
	test('', async () => {
		const res = await flow(
			toPush(iterable([9, 2, 0])),
			map(async (v) => {
				await timed(v * 10)
				return v
			}),
			mapAsync(id),
			collectAsync(arrayFold()),
		)
		expect(res).toEqual([0, 2, 9])
	})
})
