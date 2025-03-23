import type { Config } from "./config/types.ts";

export type { Config };

/**
 * Generates artifacts based on the configuration object
 *
 * @param config - The configuration object or a function that returns the configuration object
 * @example
 *
 * import { generateArtifacts } from "@smootclose/quadlet-forge";
 *
 * // as an object
 * const config = generateArtifacts({
 *   distro: "fedora-coreos",
 *   user: "quadlet",
 * });
 *
 * // or as a function
 * const config = generateArtifacts(() => {
 *
 *  // some custom logic to generate the config
 *
 * return {
 *  distro: "fedora-coreos",
 *  user: "quadlet",
 * }
 * })
 */
export function generateArtifacts(config: Config): Config;
export function generateArtifacts(config: () => Config): Config;
export function generateArtifacts(config: Config | (() => Config)): Config {
  const resolvedConfig = typeof config === "function" ? config() : config;

  /*const parsedConfig = configSchema.safeParse(resolvedConfig);

  if (!parsedConfig.success) {
    throw new Error(
      `Invalid config. Please fix all typescript errors and 
         ensure that the configuration object matches the schema.`
    );
  }*/

  return resolvedConfig;
}
