export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

// https://stackoverflow.com/questions/74697633/how-does-one-deduplicate-a-union
export type UnionToIntersection<U> = (
	U extends any ? (k: U) => void : never
) extends (k: infer I) => void
	? I
	: never
type LastOf<T> =
	UnionToIntersection<T extends any ? () => T : never> extends () => infer R
		? R
		: never
export type Dedupe<
	T,
	L = LastOf<T>,
	N = [T] extends [never] ? true : false,
> = true extends N ? never : Dedupe<Exclude<T, L>> | L
