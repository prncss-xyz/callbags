import { Source } from './sources'

// TODO: observable,
// TODO: operators: flatten, zip, concat, group
// TODO: dest/non-dest fold
// TODO: type sync/async
// TODO: mount more lazy
// TODO: fix take

export function _identity<Init, Value, Index, Err, R>() {
	return function (
		source: Source<Init, Value, Index, Err, R>,
	): Source<Init, Value, Index, Err, R> {
		return function (args) {
			return source(args)
		}
	}
}

export function flatten<Init, Value, Index, Err, R>() {
	return function (
		source: Source<Init, Value, Index, Err, R>,
	): Source<Init, Value, Index, Err, R> {
		return function (args) {
			// TODO:
			return source(args)
		}
	}
}

export function tap<Init, Value, Index, Err, R>(
	cb: (value: Value, index: Index) => void,
) {
	return function (
		source: Source<Init, Value, Index, Err, R>,
	): Source<Init, Value, Index, Err, R> {
		return function (args) {
			return source({
				...args,
				push(value, index) {
					cb(value, index)
					args.push(value, index)
					args.pass()
				},
			})
		}
	}
}

export function map<A, B, Index>(cb: (value: A, index: Index) => B) {
	return function <Init, Err, R>(
		source: Source<Init, A, Index, Err, R>,
	): Source<Init, B, Index, Err, R> {
		return function (args) {
			return source({
				...args,
				push(value, index) {
					args.push(cb(value, index), index)
				},
			})
		}
	}
}

export function mapAsync<A, B, Index>(
	cb: (value: A, index: Index) => Promise<B>,
) {
	return function <Init, Err, R>(
		source: Source<Init, A, Index, Err, R>,
	): Source<Init, B, Index, Err, R> {
		return function (args) {
			return source({
				...args,
				push(value, index) {
					cb(value, index).then((v) => args.push(v, index))
				},
			})
		}
	}
}

// ?? is it really idempotent
export function take(n: number) {
	return function <Init, Value, Index, Err, R>(
		source: Source<Init, Value, Index, Err, R>,
	): Source<Init, Value, Index, Err, R> {
		return function (args) {
			let count = 0
			return source({
				...args,
				push(value, index) {
					if (n === 0) {
						args.close()
						return
					}
					count++
					args.push(value, index)
					if (count === n) args.close()
					else args.pass()
				},
			})
		}
	}
}
