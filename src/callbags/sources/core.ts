export type Source<Init, Value, Index, Err, R> = (args: {
	close(): void
	error(err: Err): void
	pass(): void
	push(value: Value, index: Index): void
}) => (init: Init) => {
	mount(): () => void
	pull?: () => void
	result(): R
}
