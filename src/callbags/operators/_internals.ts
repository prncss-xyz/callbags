export function pendingCounter(onDone: () => void) {
	let completed = false
	let count = 0
	function after() {
		if (count === 0 && completed) {
			onDone()
		}
	}
	return {
		close() {
			completed = true
			after()
		},
		async wrap(p: Promise<unknown>) {
			count++
			try {
				await p
			} finally {
				count--
				after()
			}
		},
	}
}
