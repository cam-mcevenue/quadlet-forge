import type { UniqueArray } from "$lib/internal/types.ts";
import type { TemplateFile } from "$lib/builders/types.ts";
import { PODMAN_PATHS } from "$lib/shared/constants.ts";

/** Configuration object for podman .network file */
type PodmanNetworkConfig = {
  subnet: string;
  gateway: string;
};

/**  Registry of network configurations.
 * Get converted to {@linkcode PodmanNetworkRegistry} objects
 */
type PodmanNetworkRegistry = Record<string, PodmanNetworkConfig>;

/** Podman network template files keyed by network name */
type PodmanNetworkTemplates<T extends PodmanNetworkRegistry> = {
  [K in keyof T]: TemplateFile;
};

/** Template to generate dynamic podman .network quadlet files
 * @param config - The network configuration object
 * @returns The generated `.network` file contents
 */
const template = (name: string, config: PodmanNetworkConfig) =>
  `
[Network]
NetworkName=${name}
Driver=bridge
Subnet=${config.subnet}
Gateway=${config.gateway}

[Install]
WantedBy=default.target
`.trim();

/** Transforms a {@linkcode PodmanNetworkRegistry} object into a 
 * {@linkcode PodmanNetworkTemplates} object.
 * 
 * The these can then be attached to podman containers and pods. See examples below
 *
 * @param networks - Network configuration object
 * @returns Object with an {@linkcode attach} method to retrieve the networks by the {@linkcode PodmanNetworkRegistry} object key
 * 
 * @example Basic usage
 * ```ts
 * const networks = createNetworks({
 *  internal: {
 *    subnet: "10.89.0.0/24",
 *    gateway: "10.89.0.1",
 *  },
 *  external: {
 *    subnet: "10.89.1.0/24",
 *    gateway: "10.89.1.1",
 *  },
 *});

 * ```
 * @example Attach network templates
 * ```ts
 * // This works ✅
 * const validNetworks = networks.attach("internal", "external");
 * 
 * // This will give a type error ❌
 * const duplicateNetworks = networks.attach("internal", "internal");
 * ```
 */
export function createNetworks<const T extends PodmanNetworkRegistry>(
  networks: T
) {
  // Type the entries array explicitly
  const entries: {
    [K in keyof T]: [K, PodmanNetworkTemplates<T>[K]];
  }[keyof T][] = Object.entries(networks).map(([name, config]) => [
    name,
    {
      file_name: `${name}.network`,
      output_dir_local: PODMAN_PATHS.quadlet,
      contents: template(name, config),
    },
  ]);

  const templates = Object.fromEntries(entries) as PodmanNetworkTemplates<T>;

  /** Retrieves the network templates from the configuration object. Think of it like a getter
   *
   * @param names Unique network configuration keys to retrieve.
   * @typeParam K The network configuration keys from the input {@linkcode NetworkRegistry} object
   * @returns Array of `<K>.network` quadlet files as {@linkcode TemplateFile} objects
   *
   * ```
   * @example Attach network templates
   * ```ts
   * // This works ✅
   * const validNetworks = networks.attach("internal", "external");
   *
   * // This will give a type error ❌
   * const duplicateNetworks = networks.attach("internal", "internal");
   * ```
   */
  function attach<K extends (keyof T)[]>(
    ...names: K & UniqueArray<K>
  ): TemplateFile[] {
    return names.map((name) => {
      const template = templates[name];
      if (!template) {
        throw new Error(`Network ${String(name)} not found`);
      }
      return template;
    });
  }

  return {
    attach,
  };
}
