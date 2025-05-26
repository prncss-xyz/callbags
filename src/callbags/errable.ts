export type Succ<S> = {
	type: 'success'
	value: S
}

export type Err<E> = {
	type: 'error'
	value: E
}

export type Errable<S, E> = Err<E> | Succ<S>

export function success<S>(value: S): Succ<S> {
	return {
		type: 'success',
		value,
	}
}

export function error<E>(value: E): Err<E> {
	return {
		type: 'error',
		value,
	}
}
