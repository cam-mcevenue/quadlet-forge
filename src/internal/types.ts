/**
 * Expand a type to all its properties instead of &-ing them.
 * Also good for expanding functions, for seeing the shape of a type
 * instead of the alias name
 *
 * @example
 *
 * type A = { a: string, b: number }
 * type B = { c: boolean, d: string }
 *
 * type AB = A & B // { a: string, b: number } & { c: boolean, d: string }
 * type ABExpanded = Expand<AB> // { a: string, b: number, c: boolean, d: string }
 */
export type Expand<T> = T extends (...args: infer A) => infer R ? (...args: Expand<A>) => Expand<R>
    : T extends infer O ? { [K in keyof O]: O[K] }
    : never

/**
 * Similar to the Partial type, but it requires at least one key to be present
 * and no keys the don't exit on the input Object
 *
 * @example
 * type Test = AtLeastOne<{ a: string, b: number }> // { a: string } | { b: number }
 */
export type AtLeastOne<Obj, Keys = keyof Obj> = Keys extends keyof Obj ? Expand<Pick<Obj, Keys>>
    : never

export type ObjectEntryArray<T extends Record<string, unknown>> = Expand<{
    key: keyof T
    value: T[keyof T]
}>
