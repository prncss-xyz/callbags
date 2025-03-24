import { flow } from '@constellar/core'
import { describe, expect, test } from 'vitest'

import { collect } from '../sinks'
import { iterable } from '../sources'
import { scan, valueFold } from './scan'
import { take } from './take'

describe('take', () => {
	test('undefined', () => {
		const res = flow(
			iterable<number>(),
			take(0),
			scan(valueFold()),
			collect,
		)([1, 2, 3, 4])
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(
			iterable<number>(),
			take(2),
			scan(valueFold()),
			collect,
		)([1, 2, 3, 4])
		expect(res).toBe(2)
	})
	test('idempotency', () => {
		const res = flow(iterable<number>(), take(2), scan(valueFold()), collect)
		expect(res([1, 2, 3, 4])).toEqual(2)
		expect(res([1, 2, 3, 4])).toEqual(2)
	})
})
