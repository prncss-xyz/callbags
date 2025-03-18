type Source<Init, Value> = (args: {
	close(): void
	init: Init
	push(value: Value, last?: boolean): void
}) => {
	cleanup(): void
	pull(): void
}

export function eq<Init, Value>() {
	return function (source: Source<Init, Value>): Source<Init, Value> {
		return function (args) {
			return source(args)
		}
	}
}

export function tap<Init, Value>(cb: (value: Value, done?: boolean) => void) {
	return function (source: Source<Init, Value>): Source<Init, Value> {
		return function (args) {
			return source({
				...args,
				push(value, done) {
					cb(value)
					args.push(value, done)
				},
			})
		}
	}
}

export function take(n: number) {
	return function <Init, Value>(
		source: Source<Init, Value>,
	): Source<Init, Value> {
		if (n === 0) return empty()
		return function (args) {
			let count = 0
			return source({
				...args,
				push(value, done) {
					count++
					args.push(value, done || count === n)
				},
			})
		}
	}
}

export function interval(period: number): Source<void, number> {
	return function ({ push }) {
		let count = 0
		let handler = setInterval(() => push(count++), period)
		return {
			cleanup() {
				clearInterval(handler)
			},
			pull() {},
		}
	}
}

export function empty<Init, Value>(): Source<Init, Value> {
	return function ({ close }) {
		close()
		return {
			cleanup() {},
			pull() {},
		}
	}
}

export function iterable<Value>(): Source<Iterable<Value>, Value> {
	return function ({ close, init, push }) {
		const iterator = init[Symbol.iterator]()
		return {
			cleanup() {},
			pull() {
				const next = iterator.next()
				if (next.done) {
					close()
					return
				}
				push(next.value)
			},
		}
	}
}

export function observe<Init, Value>(
	source: Source<Init, Value>,
	next: (value: Value) => void,
	complete = () => {},
) {
	// do we need this
	let completed: unknown = false
	return function (init: Init) {
		function close() {
			completed = true
			complete()
			cleanup()
		}
		const { cleanup, pull } = source({
			close,
			init,
			push(value, done) {
				if (completed) return
				next(value)
				if (done) {
					close()
					return
				}
				pull()
			},
		})
		pull()
	}
}

export function collectAsync<Init, Value>(source: Source<Init, Value>) {
	type R = undefined | Value
	let result: R = undefined
	let resolve: (result: R) => void
	const promise = new Promise<R>((resolve_) => {
		resolve = resolve_
	})
	return function (init: Init) {
		observe(
			source,
			(value) => {
				result = value
			},
			() => {
				resolve(result)
			},
		)(init)
		return promise
	}
}

export function collect<Init, Value>(source: Source<Init, Value>) {
	let result: undefined | Value = undefined
	return function (init: Init) {
		observe(source, (value) => {
			result = value
		})(init)
		return result
	}
}
