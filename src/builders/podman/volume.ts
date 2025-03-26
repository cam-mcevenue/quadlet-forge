import type { Resource, ResourceConfig } from "$lib/builders/types.ts";

type PodmanVolumeTypes = "custom" | "managed";
type PodmanVolumeSecurity = "shared" | "private";

/** Configuration for podman volume resources */
type PodmanVolumeConfig = ResourceConfig<{
  /** Path where volume will be mounted inside container */
  mount_path: string;
  /** Optional host path for bind mounts
   * - If provided: Creates a bind mount from host_path
   * - If omitted: Creates a podman-managed volume named {name}.volume
   */
  host_path?: string;
  /** SELinux label for volume access control
   * - z: Share between multiple containers
   * - Z: Dedicate to a single container (more secure)
   */
  selinux_label?: "Z" | "z";
}>;

/** Type for the fully resolved volume paths used in container templates */
type PodmanVolumeConfigResolved<T extends PodmanVolumeConfig> = ResourceConfig<{
  id: T["id"];
  /** The volume source path
   * - For bind mounts: The host_path (/host/path)
   * - For podman volumes: Name with .volume suffix (volume-name.volume)
   */
  host_path: T["host_path"] extends string
    ? `${T["host_path"]}`
    : `${T["id"]}.volume`;

  /** The container mount path with optional SELinux label
   * @example With SELinux: "/data:Z"
   * @example Without SELinux: "/data"
   */
  mount_path: T["selinux_label"] extends "Z" | "z"
    ? `${T["mount_path"]}:${T["selinux_label"]}`
    : `${T["mount_path"]}`;
}>;

/** Build the source path for a volume */
function buildHostPath(config: PodmanVolumeConfig): string {
  return config.host_path ?? `${config.id}.volume`;
}

/** Build the mount path with optional SELinux label */
function buildMountPath(config: PodmanVolumeConfig): string {
  return config.selinux_label
    ? `${config.mount_path}:${config.selinux_label}`
    : config.mount_path;
}

/** Template to generate dynamic podman .volume quadlet files
 * @param name - Volume name
 * @param config - Volume configuration
 */
const template = (name: string, config: PodmanVolumeConfig) =>
  `
[Volume]
`.trim();

/** Creates `podman volume` with quadlet template generation method
 *
 * @param config Object {@linkcode PodmanVolumeConfig} configuration
 * @returns A {@linkcode Resource} object with `config` type {@linkcode PodmanVolumeConfigResolved}
 * 
 * @see 
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
function createVolume<const T extends PodmanVolumeConfig>(
  config: T
): Resource<"volume", PodmanVolumeConfigResolved<T>> {
  const { id, ..._config } = config;

  return {
    type: "volume",
    id,
    config: {
      id,
      host_path: buildHostPath(config) as any,
      mount_path: buildMountPath(config) as any,
    },
    generateFileTemplate: () => template(id, config),
  };
}
