import { noop } from '@constellar/core'
import { fromInit, Init } from '@prncss-xyz/utils'

import { AnyPullPush, Pull, Push, Source } from './core'

export function empty<Value, Index = void>(): Source<
	Value,
	Index,
	never,
	void,
	Pull
> {
	return function ({ complete }) {
		return {
			pull: complete,
			result: noop,
			unmount: noop,
		}
	}
}

/**
 * @param init - a value or a function returning this value
 * @returns a source emitting the value once
 */
export function once<Value, Index = void>(
	init: Init<Value>,
	index?: Index,
): Source<Value, Index, never, void, Pull> {
	return function ({ complete, next }) {
		return {
			pull() {
				next(fromInit(init), index!)
				complete()
			},
			result: noop,
			unmount: noop,
		}
	}
}

export function onceAsync<Value, Index = void>(
	init: Init<Promise<Value>>,
	index?: Index,
): Source<Value, Index, never, void, Push> {
	return function ({ complete, next }) {
		fromInit(init).then((value) => {
			next(value, index!)
			complete()
		})
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

function isIterable<Value>(v: unknown): v is Iterable<Value> {
	return v !== null && typeof v === 'object' && Symbol.iterator in v
}

export function iterable<Value>(
	init: Iterable<Value>,
): Source<Value, number, never, void, Pull> {
	return function ({ complete, next }) {
		let index = 0
		const iterator = init[Symbol.iterator]()
		return {
			pull() {
				const result = iterator.next()
				if (result.done) {
					complete()
					return
				}
				next(result.value, index++)
			},
			result: noop,
			unmount: noop,
		}
	}
}

function isAsyncIterable<Value>(v: unknown): v is AsyncIterable<Value> {
	return v !== null && typeof v === 'object' && Symbol.asyncIterator in v
}

export function asyncIterable<Value>(
	values: AsyncIterable<Value>,
): Source<Value, number, never, void, Push> {
	return function ({ complete, next }) {
		let index = 0
		;(async () => {
			for await (const value of values) {
				next(value, index++)
			}
			complete()
		})()
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}

function isFunction<T>(v: unknown): v is Function<T> {
	return typeof v === 'function'
}

// source: https://blog.ndpsoftware.com/2023/05/is-promise
export function isPromise<T = unknown>(
	obj: unknown,
): obj is T extends { then: (...args: unknown[]) => unknown }
	? Promise<Awaited<T>>
	: never {
	return (
		!!obj &&
		(typeof obj === 'object' || typeof obj === 'function') &&
		typeof (obj as any).then === 'function'
	)
}

type NonFunction<T> = T extends (...args: any[]) => any ? never : T
type Function<T> = T extends (...args: any[]) => never ? any : T
export type ProSource<Value, Index, Err, R, P extends AnyPullPush> =
	| AsyncIterable<Value>
	| Iterable<Value>
	| NonFunction<Value>
	| Promise<Value>
	| Source<Value, Index, Err, R, P>


export function toSource<Value>(
	proSource: AsyncIterable<Value>,
): Source<Value, void, never, void, Push>
export function toSource<Value>(
	proSource: Iterable<Value>,
): Source<Value, number, never, void, Pull>
export function toSource<Value>(
	proSource: Promise<Value>,
): Source<Value, number, never, void, Push>
export function toSource<Value, Index, Err, R, P extends AnyPullPush>(
	proSource: Source<Value, Index, Err, R, P>,
): Source<Value, Index, Err, R, P>
export function toSource<Value>(
	proSource: NonFunction<Value>,
): Source<Value, void, never, void, Pull>
export function toSource<Value, Index, Err, R, P extends AnyPullPush>(
	proSource: ProSource<Value, Index, Err, R, P>,
) {
	if (isFunction(proSource)) return proSource
	if (isAsyncIterable(proSource)) return asyncIterable(proSource)
	if (isIterable(proSource)) return iterable(proSource)
	if (isPromise(proSource)) return onceAsync(proSource)
	return once(proSource)
}
