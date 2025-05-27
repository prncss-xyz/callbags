import { flow, pipe } from '@constellar/core'

import { val } from '../sinks'
import { iterable } from '../sources'
import { fold, last } from './scan'
import { take } from './take'

describe('take', () => {
	test('undefined', () => {
		const res = flow(iterable([1, 2, 3, 4]), take(0), fold(last()), val())
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(iterable([1, 2, 3, 4]), take(2), fold(last()), val())
		expect(res).toBe(2)
	})
	test('idempotency', () => {
		const res = pipe(iterable<number>, take(2), fold(last()), val())
		expect(res([1, 2, 3, 4])).toEqual(2)
		expect(res([1, 2, 3, 4])).toEqual(2)
	})
})
