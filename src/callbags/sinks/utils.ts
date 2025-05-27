export function deferCond(sync: unknown, cb: () => void) {
	if (sync) cb()
	else setTimeout(cb, 0)
}
