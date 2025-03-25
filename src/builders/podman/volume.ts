import type {
  PodmanResourceFactory,
  PodmanResource,
} from "$lib/builders/podman/types.ts";
import type { Expand } from "$lib/internal/types.ts";
import { PODMAN_PATHS } from "$lib/shared/constants.ts";

/** Configuration for podman volume resources */
export type PodmanVolumeConfig = {
  /** Name of the volume (used in quadlet file name) */
  readonly name: string;
  /** Path where volume will be mounted inside container */
  readonly mount_path: string;
  /** Optional host path for bind mounts
   * - If provided: Creates a bind mount from host_path
   * - If omitted: Creates a podman-managed volume named {name}.volume
   */
  readonly host_path?: string;
  /** SELinux label for volume access control
   * - z: Share between multiple containers
   * - Z: Dedicate to a single container (more secure)
   */
  readonly selinux_label?: "Z" | "z";
};

/** Type for the fully resolved volume paths used in container templates */
type ResolvedVolumeConfig<T extends PodmanVolumeConfig> = Expand<{
  /** The volume source path
   * - For bind mounts: The host_path (/host/path)
   * - For podman volumes: Name with .volume suffix (volume-name.volume)
   */
  readonly host_path: string;

  /** The container mount path with optional SELinux label
   * @example With SELinux: "/data:Z"
   * @example Without SELinux: "/data"
   */
  readonly mount_path: string;
}>;

/** Build the source path for a volume */
function buildHostPath(config: PodmanVolumeConfig): string {
  return config.host_path ?? `${config.name}.volume`;
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

/** Creates podman volume resources with quadlet template generation
 * @param volumes Volume configurations with unique names
 * @returns PodmanResource object (see {@linkcode PodmanResource})
 *
 * @see {@link PodmanResourceFactory} for more information on the resource factory pattern
 *
 * @example Creating volumes
 * ```ts
 * const volumes = createVolumes([{
 *   // Podman-managed volume
 *   name: "db-data",
 *   mount_path: "/var/lib/postgresql/data",
 *   selinux_label: "Z"
 * }, {
 *   // Host bind mount
 *   name: "config",
 *   mount_path: "/etc/myapp/config",
 *   host_path: "/home/user/myapp/config",
 *   selinux_label: "z"
 * }]);
 *
 * // Use volumes in container config
 * const names = volumes.use(["db-data", "config"]);
 * // Returns {host_path: string, mount_path: string}[]
 *
 * // Get quadlet files (only for podman-managed volumes)
 * // Will throw an error if bind mounts are included
 * const templates = volumes.getFileTemplates(["db-data"]);
 * ```
 */
export const createVolumes: PodmanResourceFactory<
  PodmanVolumeConfig,
  "volume",
  ResolvedVolumeConfig<PodmanVolumeConfig>[]
> = (volumes) => {
  // Only create templates for podman-managed volumes
  const templates = volumes
    .filter((config) => !config.host_path)
    .map((config) => ({
      file_name: `${config.name}.volume` as const,
      output_dir_local: PODMAN_PATHS.quadlet,
      contents: `[Volume]`, // TODO: Add volume template contents
    }));

  return {
    use: (names) => {
      const validNames = names.every((name) =>
        volumes.some((v) => v.name === name)
      );
      if (!validNames) {
        throw new Error(`Invalid volume names: ${names.join(", ")}`);
      }
      return names.map((name) => {
        const volume = volumes.find((v) => v.name === name)!;
        return {
          host_path: buildHostPath(volume),
          mount_path: buildMountPath(volume),
        };
      });
    },
    getFileTemplates: (names) => {
      // Check for bind mounts trying to get templates
      const bindMounts = names.filter((name) =>
        volumes.find((v) => v.name === name && v.host_path)
      );

      if (bindMounts.length > 0) {
        throw new Error(
          `Cannot get quadlet templates for bind mounts: [${bindMounts}]. Only podman-managed volumes generate template files.`
        );
      }

      return templates.filter((t) => names.includes(t.file_name.split(".")[0]));
    },
  };
};

const volumes = createVolumes([
  {
    // Podman-managed volume
    name: "db-data",
    mount_path: "/var/lib/postgresql/data",
    selinux_label: "Z",
  },
  {
    // Host bind mount
    name: "config",
    mount_path: "/etc/myapp/config",
    host_path: "/home/user/myapp/config",
    selinux_label: "z",
  },
]);

// Use volumes in container config
const names = volumes.use(["db-data", "config"]);
