import { flow } from '@constellar/core'

import { either, success } from '../../unions/either'
import { just, maybe } from '../../unions/maybe'
import { fold, last } from '../operators/scan/core'
import { take } from '../operators/take'
import { iterable } from '../sources/basics'
import { interval } from '../sources/extras'
import { extract } from './observe'

describe('collect', () => {
	test('collect last number', () => {
		const res = flow(iterable([1, 2, 3, 4]), fold(last()), extract(either()))
		expect(res).toEqual(success.of(4))
	})
})

describe('collectAsync', () => {
	test('interval', async () => {
		const res = await flow(interval(1), take(4), fold(last()), extract(maybe()))
		expect(res).toEqual(just.of(3))
	})
})
