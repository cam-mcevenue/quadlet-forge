import type { Resource, ResourceConfig } from "$lib/builders/types.ts";
import type { UniqueObjectKeyArray } from "$lib/internal/types.ts";

/** Configuration object for podman .network file */
type PodmanNetworkConfig = ResourceConfig<{
  /** Subnet in CIDR notation (e.g. '10.89.0.0/24') */
  //subnet: string;
  /** Gateway IP address (e.g. '10.89.1.1') */
  //gateway: string;
}>;

/** Typed network returned from {@linkcode createNetwork} and {@linkcode registerNetworks} */
type PodmanNetwork = Resource<"network", PodmanNetworkConfig>;

type PodmanNetworkDependency = {
  networks: PodmanNetwork[];
};

/** Template to generate dynamic podman .network quadlet files
 * @param config - A {@linkcode PodmanNetworkConfig} object
 * @returns The generated `.network` file contents
 */
const template = (config: PodmanNetworkConfig) =>
  `
[Network]
NetworkName=${config.id}
Driver=bridge

[Install]
WantedBy=default.target
`.trim();

/** Creates `podman network` with quadlet template generation method
 *
 * @param config Network configuration
 * @returns A {@linkcode Resource} object with `config` type {@linkcode PodmanNetworkConfig}
 *
 * @example Create a network
 * ```ts
 * const appNetwork = createNetwork({
 *   id: "app",
 *   subnet: "10.89.0.0/24",
 *   gateway: "10.89.0.1"
 * });
 * ```
 */
function createNetwork<const T extends PodmanNetworkConfig>(
  config: T
): Resource<"network", T> {
  return {
    type: "network",
    id: config.id,
    config: () => config,
    generateFileTemplate: () => template(config),
  };
}

/** A `podman network` resource factory
 *
 * @param configs Array of {@linkcode PodmanNetworkConfig} configurations
 * @returns Object with `use` method to get network configurations by name
 *
 * @example Network creation/registration
 * ```ts
 * const networks = registerNetworks([
 *   {
 *     id: "app",
 *     subnet: "10.89.0.0/24",
 *     gateway: "10.89.0.1",
 *   },
 *   {
 *     id: "db",
 *     subnet: "10.89.0.1/24",
 *     gateway: "10.89.0.1",
 *   },
 * ]);
 * // Retrieve network configuration to be used in other resources
 * const names = networks.use(["app"]); // PodmanNetworkConfig for 'app' network
 * ```
 */
function registerNetworks<const T extends PodmanNetworkConfig[]>(
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

export { createNetwork, registerNetworks };
export type { PodmanNetwork, PodmanNetworkDependency, PodmanNetworkConfig };
