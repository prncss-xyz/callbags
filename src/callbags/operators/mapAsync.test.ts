import { flow, id } from '@constellar/core'
import { timed } from '@prncss-xyz/utils'
import { describe, expect, test } from 'vitest'

import { map } from '.'
import { toPush, valAsync } from '../sinks'
import { iterable } from '../sources'
import { mapAsync } from './mapAsync'
import { arrayFold, fold } from './scan'

describe('mapAsync', () => {
	test('', async () => {
		const res = await flow(
			toPush(iterable([9, 2, 0])),
			map(async (v) => {
				await timed(v * 10)
				return v
			}),
			mapAsync(id),
			fold(arrayFold()),
			valAsync(),
		)
		expect(res).toEqual([0, 2, 9])
	})
})
