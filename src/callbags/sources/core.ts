export type Source<Value, Index, Err, R> = (args: {
	close(): void
	error(err: Err): void
	push(value: Value, index: Index): void
}) => {
	pull?: () => void
	result(): R
	unmount(): void
}
