import { describe, expect, test } from 'vitest'

import { sortedAdd } from './internal'

describe('sortedAdd', () => {
	const add = sortedAdd<number>((a, b) => a - b)
	test('empty', () => {
		expect(add(0, [])).toEqual([0])
	})
	test('before', () => {
		expect(add(0, [1])).toEqual([0, 1])
	})
	test('equal', () => {
		expect(add(1, [1])).toEqual([1])
	})
	test('after', () => {
		expect(add(2, [1])).toEqual([1, 2])
	})
})
