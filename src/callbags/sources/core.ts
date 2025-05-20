export type Pull = () => void
export type Push = undefined
export type AnyPullPush = Pull | Push

export type Source<Value, Index, Err, R, P extends AnyPullPush> = (args: {
	close(): void
	error(err: Err): void
	push(value: Value, index: Index): void
}) => {
	pull: P
	result(): R
	unmount(): void
}
