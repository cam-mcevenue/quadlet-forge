/** Type-safe context key that preserves the type of stored value
 * @template T The type of value stored with this key
 */
type ContextKey<T = unknown> = symbol & { __type: T };

/** Represents an immutable map of context values
 * Keys are symbols that preserve their associated value types
 */
type Context = Map<symbol, unknown>;

/** Creates a new empty context map
 * @returns A new empty Context instance
 *
 * @example
 * ```ts
 * const context = createContext();
 * ```
 */
function createContext(): Context {
  return new Map();
}

/** Creates a new context with an additional key-value pair
 * @template T The type of value being added
 * @param context The existing context to extend
 * @param key The typed context key
 * @param value The value to associate with the key
 * @returns A new Context instance with the added key-value pair
 *
 * @example
 * ```ts
 * const podCtx = createContextKey<PodmanPod>();
 * const newContext = withContext(context, podCtx, pod);
 * ```
 */
function withContext<T>(
  context: Context,
  key: ContextKey<T>,
  value: T
): Context {
  const newContext = new Map(context);
  newContext.set(key, value);
  return newContext;
}

/** Retrieves a value from context by its key
 * @template T The expected type of the value
 * @param context The context to get the value from
 * @param key The typed context key
 * @returns The value if found, undefined otherwise
 *
 * @example
 * ```ts
 * const pod = getFromContext(context, POD_CTX);
 * if (pod) {
 *   // Use pod context...
 * }
 * ```
 */
function getContext<T>(context: Context, key: ContextKey<T>): T | undefined {
  return context.get(key) as T | undefined;
}

/** Creates a typed context key
 * @template T The type of value this key will store
 * @returns A new ContextKey that preserves its value type
 *
 * @example
 * ```ts
 * const POD_CTX = createContextKey<PodmanPod>();
 * const NETWORK_CTX = createContextKey<PodmanNetwork[]>();
 * ```
 */
function createContextKey<T>(): ContextKey<T> {
  return Symbol() as ContextKey<T>;
}

export { createContext, createContextKey, getContext, withContext };

export type { Context, ContextKey };
