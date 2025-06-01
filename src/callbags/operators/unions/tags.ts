type Tagged<Type, Value> = { readonly type: Type; readonly value: Value }

export function tag<Type extends symbol>(type: Type) {
	return function <D>() {
		return new OpenTag<Type, D>(type)
	}
}

class OpenTag<Type, D> {
	private readonly type: Type
	constructor(type: Type) {
		this.type = type
	}
	get<Value extends D>(m: Tagged<Type, Value>) {
		return m.value
	}
	is<Value extends D>(
		m: Tagged<Exclude<unknown, Type>, unknown> | Tagged<Type, Value>,
	): m is Tagged<Type, Value> {
		return m.type === this.type
	}
	of<Value extends D>(value: Value): Tagged<Type, Value> {
		return { type: this.type, value }
	}
	void(_v: D extends void ? void : never) {
		return this.of(_v as any)
	}
}
