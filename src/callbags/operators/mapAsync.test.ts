import { flow, id } from '@constellar/core'
import { timed } from '@prncss-xyz/utils'
import { describe, expect, test } from 'vitest'

import { value } from '../../unions/value'
import { extract, toPush } from '../sinks/observe'
import { iterable } from '../sources/basics'
import { map } from './map'
import { mapAsync } from './mapAsync'
import { collect, fold } from './scan/core'

describe('mapAsync', () => {
	test('', async () => {
		const res = await flow(
			toPush(iterable([9, 2, 0])),
			map(async (v) => {
				await timed(v * 10)
				return v
			}),
			mapAsync(id),
			fold(collect()),
			extract(value()),
		)
		expect(res).toEqual([0, 2, 9])
	})
})
