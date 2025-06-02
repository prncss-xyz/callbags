import { flow } from '@constellar/core'
import { mul } from '@prncss-xyz/utils'

import { just, maybe } from '../../unions/maybe'
import { extract } from '../sinks/observe'
import { iterable } from '../sources/basics'
import { map } from './map'
import { fold, last } from './scan/core'

describe('map', () => {
	test('changes type', () => {
		const res = flow(
			iterable([1, 2, 3, 4]),
			map(mul(2)),
			map(String),
			map((x, i) => x + i),
			fold(last()),
			extract(maybe()),
		)
		expect(res).toEqual(just.of('83'))
	})
})
