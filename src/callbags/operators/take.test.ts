import { flow, pipe } from '@constellar/core'

import { EmptyError } from '../../errors'
import { either, error } from '../../unions/either'
import { just, maybe } from '../../unions/maybe'
import { extract } from '../sinks/observe'
import { iterable } from '../sources/basics'
import { fold, last } from './scan/core'
import { take } from './take'

describe('take', () => {
	test('undefined', () => {
		const res = flow(
			iterable([1, 2, 3, 4]),
			take(0),
			fold(last()),
			extract(either()),
		)
		expect(res).toEqual(error.of(new EmptyError()))
	})
	test('defined', () => {
		const res = flow(
			iterable([1, 2, 3, 4]),
			take(2),
			fold(last()),
			extract(maybe()),
		)
		expect(res).toEqual(just.of(2))
	})
	test('idempotency', () => {
		const res = pipe(iterable<number>, take(2), fold(last()), extract(maybe()))
		expect(res([1, 2, 3, 4])).toEqual(just.of(2))
		expect(res([1, 2, 3, 4])).toEqual(just.of(2))
	})
})
