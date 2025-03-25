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
export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

/**
 * Similar to the Partial type, but it requires at least one key to be present
 * and no keys the don't exit on the input Object
 *
 * @example
 * type Test = AtLeastOne<{ a: string, b: number }> // { a: string } | { b: number }
 */
export type AtLeastOne<Obj, Keys = keyof Obj> = Keys extends keyof Obj
  ? Expand<Pick<Obj, Keys>>
  : never;

export type ObjectEntryArray<T extends Record<string, unknown>> = Expand<{
  key: keyof T;
  value: T[keyof T];
}>;

/**  Checks an array for duplicate values */
type HasDuplicate<T extends readonly any[]> = T extends readonly [
  infer X,
  ...infer Rest
]
  ? X extends Rest[number]
    ? true
    : HasDuplicate<Rest>
  : false;

/** Gets the values of common keys in an array of `readonly` objects and returns a Union of the values
 *
 * @typeParam T - The array of `readonly` objects
 *
 * @example
 * ```ts
 * const objects = [
 *   { id: 1, name: "foo" },
 *   { id: 2, name: "bar" },
 *   { id: 3, name: "baz", age: 25 }
 * ] as const;
 *
 * // Result: CommonKeyUnion = "id" | "name"
 * type CommonKeyUnion = GetCommonKeys<typeof objects>;
 * ```
 */
export type GetCommonKeys<T extends readonly Record<string, unknown>[]> =
  keyof T[number];

/** Gets a union of all values for a specific key in an array of objects
 *
 * @typeParam T - The array of readonly objects
 * @typeParam K - The key to get values for
 *
 * @example
 * ```ts
 * const objects = [
 *   { id: 1, name: "foo" },
 *   { id: 2, name: "bar" },
 *   { id: 3, name: "baz" }
 * ] as const;
 *
 * type IdValues = GetKeyValues<typeof objects, "id">; // 1 | 2 | 3
 * type NameValues = GetKeyValues<typeof objects, "name">; // "foo" | "bar" | "baz"
 * ```
 */
export type GetKeyValues<
  T extends readonly Record<string, unknown>[],
  K extends keyof T[number]
> = T[number][K];

/** Gets all duplicate values from a `readonly` array
 *
 * @typeParam T - The `readonly` array of values
 * @typeParam Seen - The array of values that have been seen
 * @typeParam Result - A Union of the duplicate values or `never`
 *
 * @example Duplicate case
 * ```ts
 * const duplicates = [1, 2, 2, 3, 3, 4] as const;
 * type Duplicates = GetDuplicateValues<typeof duplicates>; // 2 | 3
 * ```
 *
 * @example No duplicates case
 * ```ts
 * const noDuplicates = [1, 2, 3, 4] as const;
 * type NoDuplicates = GetDuplicateValues<typeof noDuplicates>; // never
 * ```
 */
export type GetDuplicateArrayValues<
  T extends readonly unknown[],
  Seen extends unknown[] = [],
  Result = never
> = T extends readonly [infer First, ...infer Rest]
  ? First extends Seen[number]
    ? GetDuplicateArrayValues<Rest, Seen, Result | First>
    : GetDuplicateArrayValues<Rest, [...Seen, First], Result>
  : Result;

/** Gets the values of a common key in an array of `readonly` objects and returns a `readonly` array of the values
 *
 * @typeParam T - Array of `readonly` objects
 * @typeParam K - Common object key to extract values from
 * @returns `readonly` array of `K` values
 *
 * @example
 * ```ts
 * const objects = [
 *  { id: 1, name: "foo" },
 *  { id: 2, name: "bar" }
 * ]
 * type KeyValues = ObjectKeyValuesArray<typeof objects, "id">; // readonly [1, 2]
 
 * ```
 */
export type ObjectKeyValuesArray<
  T extends readonly Record<string, unknown>[],
  K extends keyof T[number]
> = { readonly [P in keyof T]: T[P][K] };

/** Ensures array has unique values for a common key `K`
 *
 * Meant to be used for functions that require an array of objects with a unique key value
 *
 * @typeParam T - The array of `readonly` objects
 * @typeParam K - The common key to check for duplicates
 * @typeParam M - The error message to display if duplicates are found
 * @returns `T` if no duplicates are found, otherwise `M`
 *
 * @example Success case
 * ```ts
 * const noDuplicates = [
 *  { id: 1, name: "foo" },
 *  { id: 2, name: "bar" }
 * ] as const
 * type NoDuplicates = UniqueObjectKeyArray<typeof noDuplicates, "name"> //
 * // NoDuplicates = [{ id: 1, name: "foo" }, { id: 2, name: "bar" }]
 * ```
 *
 * @example Error case
 * ```ts
 * const duplicates = [
 *  { id: 1, name: "foo" },
 *  { id: 2, name: "foo" }
 * ] as const
 * type Duplicates = UniqueObjectKeyArray<typeof duplicates, "name">;
 * // Duplicates = "Duplicate values found for key "name": "foo""
 * ```
 */
export type UniqueObjectKeyArray<
  T extends readonly Record<string, unknown>[],
  K extends keyof T[number],
  M extends string = `Duplicate values found for key "${K &
    string}": ${GetDuplicateArrayValues<ObjectKeyValuesArray<T, K>> & string}`
> = GetDuplicateArrayValues<ObjectKeyValuesArray<T, K>> extends never ? T : M;

/** Ensures array has only unique values
 *
 * @typeParam T - The readonly array to check
 * @typeParam M - The error message to display if duplicates are found
 *
 * @example Success case
 * ```ts
 * const unique = [1, 2, 3] as const;
 * type Unique = UniqueArray<typeof unique>; // readonly [1, 2, 3]
 * ```
 *
 * @example Error case
 * ```ts
 * const duplicates = [1, 2, 2, 3] as const;
 * type Duplicates = UniqueArray<typeof duplicates>;
 * // "Duplicate values found: 2"
 * ```
 */
export type UniqueArray<
  T extends readonly unknown[],
  M extends string = `Duplicate values found: ${GetDuplicateArrayValues<T> &
    string}`
> = GetDuplicateArrayValues<T> extends never ? T : M;
