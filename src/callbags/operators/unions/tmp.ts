import { flow } from '@constellar/core'

import { just } from './maybe'
import { tag } from './tags'

const TOTO = Symbol('TOTO')
const toto = tag(TOTO)<number>()
type Toto = ReturnType<typeof toto.of>

const PIPI = Symbol('PIPI')
const pipi = tag(PIPI)<string>()
type Pipi = ReturnType<typeof pipi.of>

export function f(t: Pipi | Toto) {
	return flow(
		t,
		toto.map((x) => x + 2),
		pipi.map((x) => x + '!'),
	)
}

const x = just.of(3)
const l = flow(
	just.of(3),
	just.map((x) => x * 2),
	just.map((x) => x + 'a'),
	just.map((x) => x * 2),
)

function f(j: Pipi | Toto) {
	return flow(
		j,
		toto.map((x) => x * 2),
		pipi.map((x) => x + '!'),
		toto.chain((x) => toto.of(x * 2)),
		toto.map((x) => x * 2),
	)
}
