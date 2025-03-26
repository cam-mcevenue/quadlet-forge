import type { Resource, ResourceConfig } from "$lib/builders/types.ts";
import type { UniqueObjectKeyArray } from "$lib/internal/types.ts";

/** Configuration object for podman .network file */
export type PodmanNetworkConfig = ResourceConfig<{
  /** Subnet in CIDR notation (e.g. '10.89.0.0/24') */
  subnet: string;
  /** Gateway IP address (e.g. '10.89.1.1') */
  gateway: string;
}>;

/** Template to generate dynamic podman .network quadlet files
 * @param config - A {@linkcode PodmanNetworkConfig} object
 * @returns The generated `.network` file contents
 */
const template = (id: string, config: PodmanNetworkConfig) =>
  `
[Network]
NetworkName=${id}
Driver=bridge
Subnet=${config.subnet}
Gateway=${config.gateway}

[Install]
WantedBy=default.target
`.trim();

/** Creates `podman network` with quadlet template generation method
 *
 * @param config Network configuration
 * @returns A {@linkcode Resource} object with `config` type {@linkcode PodmanNetworkConfig}
 * 
 * @example Network create
 * ```ts
 * const appNetwork = createNetwork({
 *   id: "app",
 *   subnet: "10.89.0.0/24",
 *   gateway: "10.89.0.1"
 * });
 *```

 * @example Network file generation
 * ```ts
 * appNetwork.generateFileTemplate(); // Returns quadlet file contents as template string
 * ```
 */
function createNetwork<const T extends PodmanNetworkConfig>(
  config: T
): Resource<"network", T> {
  const { id, ..._config } = config;

  return {
    type: "network",
    id,
    config,
    generateFileTemplate: () => template(id, config),
  };
}

/** A `podman network` resource factory
 *
 * @param configs Array of {@linkcode PodmanNetworkConfig} configurations
 * @returns Object with `use` method to get network configurations by name
 *
 * @example Network creation/registration
 * ```ts
 * const networks = registerNetworks([{
 *   name: "app",
 *   subnet: "10.89.0.0/24",
 *   gateway: "10.89.0.1"
 * },
 * {
 *   name: "db",
 *   subnet: "10.89.0.1/24",
 *   gateway: "10.89.0.1"
 * }]);
 *
 * // Retrieve network configuration to be used in other resources
 * const names = networks.use("app"); // PodmanNetworkConfig for 'app' network
 * ```
 */
export function registerNetworks<const T extends PodmanNetworkConfig[]>(
  networks: UniqueObjectKeyArray<T, "id">
) {
  const networkMap = new Map<string, Resource<"network", T[number]>>();
  networks.forEach((network) => {
    networkMap.set(network.id, createNetwork(network));
  });

  return {
    use: <const Names extends T[number]["id"][]>(names: [...Names]) =>
      names.map(
        (name) =>
          networkMap.get(name) as Resource<
            "network",
            Extract<T[number], { id: Names[number] }>
          >
      ),
  };
}
