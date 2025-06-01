import { Guarded } from './guards'

type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

type Tagged<Type, Value> = { readonly type: Type; readonly value: Value }
type AnyTagged = Tagged<unknown, unknown>

type AnyValue<Type, U> = (Tagged<Type, unknown> & U)['value']
type Self<Type, U, Value extends AnyValue<Type, U>> = Prettify<
	Tagged<Type, Value> & U
>
type Other<Type, U, Value extends AnyValue<Type, U>> = Exclude<
	U,
	Self<Type, U, Value>
>

class Tag<U extends AnyTagged, Type extends U['type']> {
	private readonly type: Type
	constructor(type: Type) {
		this.type = type
	}
	chain<A extends AnyValue<Type, U>, B extends AnyValue<Type, U>>(
		f: (a: A) => Self<Type, U, B>,
	) {
		return (
			m: Other<Type, U, A> | Self<Type, U, A>,
		): Other<Type, U, A> | Self<Type, U, B> => {
			if (this.is(m)) return f(m.value)
			return m
		}
	}
	get<A extends AnyValue<Type, U>>(m: Self<Type, U, A>) {
		return m.value
	}
	is<Value extends AnyValue<Type, U>>(m: U): m is Self<Type, U, Value> {
		return m.type === this.type
	}
	map<A extends AnyValue<Type, U>, B extends AnyValue<Type, U>>(
		f: (a: A) => B,
	) {
		return (
			m: Other<Type, U, A> | Self<Type, U, A>,
		): Other<Type, U, A> | Self<Type, U, B> => {
			if (this.is(m)) return this.of(f(m.value))
			return m
		}
	}
	of<Value extends AnyValue<Type, U>>(value: Value) {
		return { type: this.type, value } as Readonly<Self<Type, U, Value>>
	}
	void(_v: (U & { type: Type })['value'] extends void ? void : never) {
		return this.of(_v)
	}
}

const _union = Symbol('union')

export function union<
	Brand extends symbol,
	Props extends Record<string, (v: any) => v is any>,
>(_brand: Brand, props: Props) {
	const members: any = {}
	for (const key of Object.keys(props)) {
		members[key] = new Tag(key)
	}
	type P = {
		[K in keyof Props]: { type: K; value: Guarded<Props[K]> }
	}
	const union = _union
	type U = Prettify<P[keyof P] & { [union]: Brand }>
	type Members = {
		[K in keyof Props]: Tag<U, K>
	}
	function isUnion(v: unknown): v is U {
		return Boolean(
			typeof v === 'object' &&
				v !== null &&
				props[(v as any).type]?.((v as any).value),
		)
	}
	return [isUnion, members as Members] as const
}
