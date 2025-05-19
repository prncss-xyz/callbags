export type AnyPull = (() => void) | undefined
export type Pull = () => void
export type NoPull = undefined

export type Source<Value, Index, Err, R, P extends AnyPull = AnyPull> = (args: {
	close(): void
	error(err: Err): void
	push(value: Value, index: Index): void
}) => {
	pull: P
	result(): R
	unmount(): void
}
