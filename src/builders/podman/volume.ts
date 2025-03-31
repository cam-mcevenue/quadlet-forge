import type { Resource, ResourceConfig } from "$lib/builders/types.ts";

/**
 * Permission configuration for bind mount volumes
 * - `private-readonly` - Private to the container or pod with readonly access
 * - `private-write` - Private to the container or pod with read/write access
 * - `shared-readonly` - Shared between containers with readonly access
 * - `shared-write` - Shared between containers with read/write access
 */
type VolumePermissions =
  | "private-readonly"
  | "private-write"
  | "shared-readonly"
  | "shared-write";

/** Base configuration required for all volume types */
type BaseVolumeConfig = ResourceConfig<{
  /** Path where volume will be mounted inside container */
  readonly mount_path: string;
}>;

/** Configuration for bind mount volumes that map host paths */
type BindMountConfig = BaseVolumeConfig & {
  /**
   * The type of volume to create
   * - `bind-mount` - Mount a host path into the container. Will not create a .volume file. Requires `host_path`
   * - `named` - Create a podman-managed volume <id>.volume. Will create a .volume file. **Host path** will be set to `<id>.volume`
   */
  readonly type: "bind-mount";
  /** Path on the host file-system container will read from/write to */
  readonly host_path: string;
  /** Volume mount permissions configuration */
  readonly permissions: VolumePermissions;
};

/** Configuration for named volumes managed by podman */
type NamedVolumeConfig = BaseVolumeConfig & {
  /**
   * The type of volume to create
   * - `bind-mount` - Mount a host path into the container. Will not create a .volume file. Requires `host_path`
   * - `named` - Create a podman-managed volume <id>.volume. Will create a .volume file. **Host path** will be set to `<id>.volume`
   */
  readonly type: "named";
};

/** Union of all supported volume configurations */
type PodmanVolumeConfig = BindMountConfig | NamedVolumeConfig;

/** Container dependency list for volumes */
type PodmanVolumeDependency = {
  volumes: PodmanVolume[];
};

/** Typed volume returned from {@linkcode createVolume} */
type PodmanVolume = Resource<"volume", PodmanVolumeConfig>;

/**
 * Builds the volume mount path with permission tags for podman
 * @see [Podman Volume Documentation](https://docs.podman.io/en/latest/markdown/podman-run.1.html#volume-v-source-volume-host-dir-container-dir-options)
 */
function buildMountPath(path: string, permissions: VolumePermissions): string {
  switch (permissions) {
    case "private-readonly":
      return `${path}:Z,ro,U`;
    case "private-write":
      return `${path}:Z,rw,U`;
    case "shared-readonly":
      return `${path}:z,ro,U`;
    case "shared-write":
      return `${path}:z,rw,U`;
  }
}

/** Template to generate dynamic podman .volume quadlet files */
const template = (name: string) =>
  `
[Volume]
`.trim();

/**
 * Creates a podman volume with quadlet template generation
 *
 * @param config Volume configuration
 * @returns Resource object for volume
 *
 * @example Named volume
 * ```ts
 * const volume = createVolume({
 *   id: "data",
 *   type: "named",
 *   mount_path: "/data"
 * });
 * ```
 *
 * @example Bind mount volume
 * ```ts
 * const volume = createVolume({
 *   id: "config",
 *   type: "bind-mount",
 *   mount_path: "/container/config",
 *   host_path: "/etc/config",
 *   permissions: "private-readonly"
 * });
 * ```
 */
function createVolume(config: PodmanVolumeConfig): PodmanVolume {
  return {
    type: "volume",
    id: config.id,
    config: () => ({
      ...config,
      host_path:
        config.type === "named" ? `${config.id}.volume` : config.host_path,
      mount_path:
        "permissions" in config
          ? buildMountPath(config.mount_path, config.permissions)
          : config.mount_path,
    }),
    generateFileTemplate: () =>
      config.type === "named" ? template(config.id) : "",
  };
}

export { createVolume };
export type {
  PodmanVolume,
  PodmanVolumeConfig,
  PodmanVolumeDependency,
  VolumePermissions,
};
