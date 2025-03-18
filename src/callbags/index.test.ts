/* eslint-disable no-console */
import { flow } from '@constellar/core'
import { expect } from 'vitest'
import { test } from 'vitest'
import { describe } from 'vitest'

import { collect, collectAsync, interval, iterable, take, tap } from '.'

function log(message: string) {
	return function (...args: unknown[]) {
		console.log(message, ...args)
	}
}

describe.skip('collect', () => {
	test('undefined', () => {
		const res = collect(take(0)(iterable<number>()))([1, 2, 3, 4])
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = collect(take(2)(iterable<number>()))([1, 2, 3, 4])
		expect(res).toEqual(2)
	})
})

describe('collectAsync', () => {
	test('undefined', async () => {
		const res = await collectAsync(take(0)(iterable<number>()))([1, 2, 3, 4])
		expect(res).toEqual(undefined)
	})
	test('defined', async () => {
		const res = await collectAsync(take(2)(iterable<number>()))([1, 2, 3, 4])
		expect(res).toEqual(2)
	})
	test('interval', async () => {
		const res = await collectAsync(flow(interval(1), take(4)))()
		expect(res).toEqual(3)
	})
})
