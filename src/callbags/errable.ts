export type Tagged<Type extends string, Value> = { type: Type; value: Value }

export function tag<Type extends string>(type: Type) {
	return {
		has<V>(
			o: Tagged<Type, V> | { type: Exclude<string, Type> },
		): o is Tagged<Type, V> {
			return o.type === type
		},
		of<V>(value: V) {
			return {
				type,
				value,
			}
		},
	}
}

export type Succ<S> = Tagged<'success', S>
export type Err<S> = Tagged<'error', S>
export type Errable<S, E> = Err<E> | Succ<S>

export const success = tag('success').of
export const error = tag('error').of
