import { noop } from '@constellar/core'

import { Source } from '../sources'

export function iterate<Init, Value, Index, Err, R>(
	source: Source<Init, Value, Index, Err, R>,
) {
	return function (init: Init) {
		return {
			[Symbol.iterator]() {
				let cleanup: () => void
				let buffer: Value[] = []
				let opened = true
				const { mount, pull } = source({
					close,
					error: (e) => {
						throw e
					},
					pass: noop,
					push: (v) => {
						buffer.push(v)
					},
				})(init)
				cleanup = mount()
				function close() {
					opened = false
					cleanup()
				}
				return {
					next() {
						if (buffer.length) {
							const value = buffer.pop() as Value
							return { done: false, value }
						}
						if (pull) {
							while (opened) {
								pull()
								if (buffer.length) {
									const value = buffer.pop() as Value
									return { done: false, value }
								}
							}
						}
						return { done: true }
					},
				}
			},
		}
	}
}

export function iterateAsync<Init, Value, Index, Err, R>(
	source: Source<Init, Value, Index, Err, R>,
) {
	return function (init: Init) {
		return {
			[Symbol.asyncIterator]() {
				let cleanup: () => void
				let buffer: Value[] = []
				let resolve = noop
				let opened = true
				const { mount, pull } = source({
					close,
					error: (e) => {
						throw e
					},
					pass: noop,
					push: (v) => {
						buffer.push(v)
						resolve()
					},
				})(init)
				cleanup = mount()
				function close() {
					opened = false
					resolve()
					cleanup()
				}
				async function next(): Promise<
					{ done: false; value: Value } | { done: true }
				> {
					while (true) {
						if (buffer.length) {
							const value = buffer.pop()!
							return { done: false, value }
						}
						if (pull && opened) {
							await new Promise<void>((resolve_) => {
								resolve = resolve_
								pull()
							})
							continue
						}
						return { done: true }
					}
				}
				return {
					next,
				}
			},
		}
	}
}
