import { flow, pipe } from '@constellar/core'

import { collect } from '../sinks'
import { iterable } from '../sources'
import { scan, valueFold } from './scan'
import { take } from './take'

describe('take', () => {
	test('undefined', () => {
		const res = flow(
			[1, 2, 3, 4],
			iterable,
			take(0),
			scan(valueFold()),
			collect,
		)
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(
			[1, 2, 3, 4],
			iterable,
			take(2),
			scan(valueFold()),
			collect,
		)
		expect(res).toBe(2)
	})
	test('idempotency', () => {
		const res = pipe(iterable<number>, take(2), scan(valueFold()), collect)
		expect(res([1, 2, 3, 4])).toEqual(2)
		expect(res([1, 2, 3, 4])).toEqual(2)
	})
})
