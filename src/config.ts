import type { Config } from "$lib/internal/config/schema.ts";

/**
 * Defines the configuration object for the project
 *
 * @param config  The configuration object or a function that returns the configuration object
 * @example
 *
 * import { defineConfig } from "@smootclose/quadlet-forge";
 *
 * // as an object
 * export default defineConfig({
 *   distro: "fedora-coreos",
 *   user: "quadlet",
 * });
 *
 * // or as a function
 * export default defineConfig(() => {
 *
 *  // some custom logic to generate the config
 *
 * return {
 *  distro: "fedora-coreos",
 *  user: "quadlet",
 * }
 * })
 */
export function defineConfig(config: Config): Config;
export function defineConfig(config: () => Config): Config;
export function defineConfig(config: Config | (() => Config)): Config {
  if (typeof config === "function") {
    return config();
  }
  return config;
}
