import { flow } from '@constellar/core'

import { take } from '../operators'
import { fold, valueFold } from '../operators/scan'
import { interval, iterable } from '../sources'
import { val } from './observe'

describe('collect', () => {
	test('collect last number', () => {
		const res = flow(iterable([1, 2, 3, 4]), fold(valueFold()), val())
		expect(res).toEqual(4)
		expectTypeOf(res).toEqualTypeOf<number | undefined>()
	})
})

describe('collectAsync', () => {
	test('interval', async () => {
		const res = await flow(interval(1), take(4), fold(valueFold()), val())
		expect(res).toEqual(3)
	})
})
