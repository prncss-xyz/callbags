import { doctest } from 'vite-plugin-doctest'
import { defineConfig } from 'vitest/config'
export default defineConfig({
	plugins: [doctest({})],
	test: {
		globals: true,
		includeSource: ['./src/**/*.[jt]s?(x)'],
	},
})
