import { flow, shallowEqual } from '@constellar/core'

import { value } from '../../../unions/value'
import { extract } from '../../sinks/observe'
import { empty, toSource } from '../../sources/basics'
import { max, maxWith, min, shuffle, sort } from './cmp'
import { fold } from './core'

describe('maxWith', () => {
	test('empty', () => {
		const res = flow(
			empty<number>(),
			fold(maxWith((a, b) => a - b)),
			extract(value()),
		)
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(
			toSource([0, 2, 1]),
			fold(maxWith((a, b) => a - b)),
			extract(value()),
		)
		expect(res).toEqual(2)
	})
})

describe('max', () => {
	test('empty', () => {
		const res = flow(empty<number>(), fold(max()), extract(value()))
		expect(res).toEqual(-Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([0, 2, 1]), fold(max()), extract(value()))
		expect(res).toEqual(2)
	})
})

describe('min', () => {
	test('empty', () => {
		const res = flow(empty<number>(), fold(min()), extract(value()))
		expect(res).toEqual(+Infinity)
	})
	test('defined', () => {
		const res = flow(toSource([1, 0, 2]), fold(min()), extract(value()))
		expect(res).toEqual(0)
	})
})

describe('sort', () => {
	test('', () => {
		const res = flow(toSource([0, 2, 2, 1]), fold(sort()), extract(value()))
		expect(res).toEqual([0, 1, 2])
	})
})

describe('shuffle', () => {
	test('', () => {
		let res: number[]
		do {
			res = flow(toSource([0, 1, 2, 3]), fold(shuffle()), extract(value()))
		} while (shallowEqual(res, [0, 1, 2, 3]))
		expect(res).not.equal([0, 1, 2, 3])
		res.sort((a, b) => a - b)
		expect(res).toEqual([0, 1, 2, 3])
	})
})
