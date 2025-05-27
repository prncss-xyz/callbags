import { flow } from '@constellar/core'

import { toPush, val } from '../sinks'
import { interval, iterable } from '../sources'
import { collect, fold } from './scan'
import { zip } from './zip'

describe('zip', () => {
	test('right shorter', () => {
		const res = flow(
			iterable([0, 1, 2]),
			zip(iterable(['a', 'b']), (a, b) => a + b),
			fold(collect()),
			val(),
		)
		expect(res).toEqual(['0a', '1b'])
		expectTypeOf(res).toEqualTypeOf<string[]>()
	})
	test('left shorter', () => {
		const res = flow(
			iterable([0, 1]),
			zip(iterable(['a', 'b', 'c']), (a, b) => a + b),
			fold(collect()),
			val(),
		)
		expect(res).toEqual(['0a', '1b'])
		expectTypeOf(res).toEqualTypeOf<string[]>()
	})
	test('left async right sync', async () => {
		const res = await flow(
			interval(10),
			zip(toPush(iterable(['a', 'b'])), (a, b) => a + b),
			fold(collect()),
			val(),
		)
		expect(res).toEqual(['0a', '1b'])
		expectTypeOf(res).toEqualTypeOf<string[]>()
	})
	test('right async left sync', async () => {
		const res = await flow(
			toPush(iterable(['a', 'b'])),
			zip(interval(10), (a, b) => a + b),
			fold(collect()),
			val(),
		)
		expect(res).toEqual(['a0', 'b1'])
		expectTypeOf(res).toEqualTypeOf<string[]>()
	})
})
