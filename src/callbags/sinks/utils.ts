export function deferCond(sync: unknown, cb: () => void) {
	if (sync) cb()
	else setTimeout(cb, 0)
}

export function exhaustive(_v: never): never {
	throw new Error('This function should never be called')
}
