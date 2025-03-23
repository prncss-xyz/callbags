import { flow } from '@constellar/core'
import { timed } from '@prncss-xyz/utils'
import { describe, expect, test } from 'vitest'

import { mapAsync } from './operators'
import { iterate, iterateAsync } from './sinks'
import { iterable } from './sources'

describe('iterate', () => {
	test('collect last number', () => {
		const res = flow(iterable<number>(), iterate)([1, 2, 3])
		expect([...res]).toEqual([1, 2, 3])
	})
})

describe('iterateAsync', () => {
	test('collect last number', async () => {
		const it = flow(
			iterable<number>(),
			mapAsync(async (x) => {
				await timed(20)
				return x
			}),
			iterateAsync,
		)([1, 2, 3])
		const xs: number[] = []
		for await (const x of it) {
			xs.push(x)
		}
		expect(xs).toEqual([1, 2, 3])
	})
})
