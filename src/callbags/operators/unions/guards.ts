export type Guarded<V> = V extends (x: any) => x is infer T ? T : never

export function isVoid(x: unknown): x is void {
	return x === undefined
}

export function isUnknown(x: unknown): x is unknown {
	return true
}
