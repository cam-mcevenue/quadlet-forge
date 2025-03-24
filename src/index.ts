import type {
  ButaneGeneratorConfig,
  ButaneUserConfig,
  QuadletGeneratorConfig,
} from "./config/types.ts";

export type { ButaneGeneratorConfig, ButaneUserConfig, QuadletGeneratorConfig };

/**
 * Generates artifacts based on the configuration object
 *
 * @param config - The configuration object or a function that returns the configuration object
 * @example Usage of generateArtifacts
 * ```typescript
 * import { generateArtifacts } from "@smootclose/quadlet-forge";
 *
 * // as an object
 * const config = generateArtifacts({
 *   distro: "fedora-coreos",
 *   user: "quadlet",
 * });
 *
 * // or as a function
 *
 * const config = generateArtifacts(() => {
 *
 *  // some custom logic to generate the config
 *
 * return {
 *  distro: "fedora-coreos",
 *  user: "quadlet",
 * }
 * })
 * ``
 */
export function generateQuadlets(
  config: QuadletGeneratorConfig
): QuadletGeneratorConfig;
export function generateQuadlets(
  config: () => QuadletGeneratorConfig
): QuadletGeneratorConfig;
export function generateQuadlets(
  config: QuadletGeneratorConfig | (() => QuadletGeneratorConfig)
): QuadletGeneratorConfig {
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
