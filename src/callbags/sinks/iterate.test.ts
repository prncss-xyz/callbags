import { flow } from '@constellar/core'
import { timed } from '@prncss-xyz/utils'
import { describe, expect, test } from 'vitest'

import { mapAsync } from '../operators'
import { iterable } from '../sources'
import { iterate, iterateAsync } from './iterate'

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
			mapAsync(async (v) => {
				await timed(v * 10)
				return v
			}),
			iterateAsync,
		)([9, 2, 0])
		const xs: number[] = []
		for await (const x of it) {
			xs.push(x)
		}
		expect(xs).toEqual([9, 2, 0])
	})
})
