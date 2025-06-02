import { flow } from '@constellar/core'
import { describe, expect, test } from 'vitest'

import { value } from '../../unions/value'
import { extract } from '../sinks/observe'
import { iterable } from '../sources/basics'
import { flatten } from './flatten'
import { collect, fold } from './scan/core'

describe('flatten', () => {
	test('collect last number', async () => {
		const res = flow(
			iterable([iterable([0, 1]), iterable([2, 3])]),
			flatten(),
			fold(collect()),
			extract(value()),
		)
		expect(res).toEqual([0, 1, 2, 3])
	})
})
