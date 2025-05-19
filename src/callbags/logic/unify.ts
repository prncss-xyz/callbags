export type LogVar<Value> = {
	id: number
} & ({ ref: number; type: 'free' } | { type: 'bound'; value: Value })

export type Context<V extends Record<string, unknown>> = {
	[K in keyof V]: LogVar<V[K]>
}
