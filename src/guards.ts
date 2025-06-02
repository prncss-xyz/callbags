export type Guarded<V> = V extends (v: any) => v is infer T ? T : never

export function isNullish(v: unknown): v is null | undefined {
	return v === null || v === undefined
}

export function isVoid(v: unknown): v is void {
	return v === undefined
}

export function isUnknown(_v: unknown): _v is unknown {
	return true
}
