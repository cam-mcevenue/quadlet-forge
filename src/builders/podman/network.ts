import type {
  PodmanResourceFactory,
  PodmanResource,
} from "$lib/builders/podman/types.ts";
import { PODMAN_PATHS } from "$lib/shared/constants.ts";

/** Configuration object for podman .network file */
type PodmanNetworkConfig = {
  readonly name: string;
  /** Subnet in CIDR notation (e.g. '10.89.0.0/24') */
  readonly subnet: string;
  /** Gateway IP address (e.g. '10.89.1.1') */
  readonly gateway: string;
};

/** Template to generate dynamic podman .network quadlet files
 * @param config - A {@linkcode PodmanNetworkConfig} object
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

/** Creates podman network resources with quadlet template generation
 *
 * @param networks Network configurations with unique names
 * @returns PodmanResource object (see {@linkcode PodmanResource})
 *
 * @see {@link PodmanResourceFactory} for more information on the resource factory pattern
 * @example Type-safe network creation
 * ```ts
 * const networks = createNetworks([{
 *   name: "app",
 *   subnet: "10.89.0.0/24",
 *   gateway: "10.89.0.1"
 * }]);
 *
 * // Use networks in container/pod config
 * const names = networks.use(["app"]); // Type: ["app"]
 *
 * // Get quadlet files for systemd
 * const files = networks.getFileTemplates(["app"]); // Type: PodmanFileConfig[]
 * ```
 *
 * Type safety prevents:
 * - Using networks that don't exist
 * - Using duplicate network names
 * - Misspelling network names
 */
export const createNetworks: PodmanResourceFactory<
  PodmanNetworkConfig,
  "network"
> = (networks) => {
  const templates = networks.map((config) => ({
    file_name: `${config.name}.network` as const,
    output_dir_local: PODMAN_PATHS.quadlet,
    contents: template(config.name, config),
  }));

  return {
    use: (names) => names,
    getFileTemplates: (names) =>
      templates.filter((t) => names.includes(t.file_name.split(".")[0])),
  };
};
