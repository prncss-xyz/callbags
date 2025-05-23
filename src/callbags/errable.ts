export type Errable<S, E> =
	| {
			type: 'error'
			value: E
	  }
	| {
			type: 'success'
			value: S
	  }

export function success<S>(value: S) {
	return {
		type: 'success' as const,
		value,
	}
}

export function error<E>(value: E) {
	return {
		type: 'error' as const,
		value,
	}
}
