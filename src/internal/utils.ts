import { ObjectEntryArray } from "./types.ts";

/**
 *  Convert an object to an array of objects with the name as a property
 *
 * @param obj The object to convert to an array
 * @example
 *
 * const obj = { a: 1, b: 2 }
 * const entries = toEntries(obj)
 *
 * // entries = [{ key: 'a', value: 1 }, { key: 'b', value: 2 }]
 */
export function toEntries<T extends Record<string, unknown>>(
  obj: T
): ObjectEntryArray<T>[] {
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value,
  })) as ObjectEntryArray<T>[];
}
