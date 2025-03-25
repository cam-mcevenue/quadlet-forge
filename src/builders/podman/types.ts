import type { PodmanPathMap } from "$lib/shared/constants.ts";
import type { FileTemplate } from "$lib/builders/types.ts";
import type {
  Expand,
  UniqueArray,
  UniqueObjectKeyArray,
  GetKeyValues,
} from "$lib/internal/types.ts";

export type AllowedExtensions = "container" | "pod" | "volume" | "network";

type PodmanPathAliases = keyof PodmanPathMap;

export type PodmanFileConfig<
  Config extends { readonly name: string },
  PathAlias extends PodmanPathAliases,
  FileExtension extends AllowedExtensions
> = Expand<
  Omit<
    FileTemplate<Config["name"], FileExtension, PodmanPathMap[PathAlias]>,
    "output_dir_local"
  > & {
    readonly output_dir_local: PodmanPathMap[PathAlias];
  }
>;

/** Ports to expose on the container or pod */
export type PortMapping = {
  /** Port on the host machine or pod (if container within a pod) */
  external: number;
  /** Internal port on the container or pod to map the external port to */
  internal: number;
};

/** Base configuration type for all Podman resources */
export type PodmanResourceConfig = {
  /** Unique name identifier for the resource */
  readonly name: string;
};

/** Interface for working with Podman resources
 *
 * Provides methods to select resources and generate their quadlet files
 * Ensures a unified API for working with Podman resources
 *
 * @typeParam Config - Resource configuration type extending PodmanResourceConfig
 * @typeParam FileExtension - Type of quadlet file to generate (see {@link AllowedExtensions})
 * @typeParam UseResult - Type of the result when using resources. Pass a custom return type to override
 *
 * Network resource examples -> {@link createNetworks}
 * Volume resource examples -> {@link createVolumes}
 */
export type PodmanResource<
  Config extends PodmanResourceConfig,
  FileExtension extends AllowedExtensions,
  UseResult
> = {
  /** Select resources by name with duplicate checking
   * @param names Array of unique resource names to use
   * @returns Array specific to the resource type. To be used to configure other resources that may depend on them
   * @throws Error if any name is invalid
   *
   *
   */
  use: <const N extends GetKeyValues<readonly Config[], "name">[]>(
    names: UniqueArray<N>
  ) => UseResult extends false ? N : UseResult;

  /** Get resource templates by name
   * @param names Array of unique resource names to get templates for
   * @returns Array of quadlet file templates for the resource
   */
  getFileTemplates: <const N extends GetKeyValues<readonly Config[], "name">[]>(
    names: UniqueArray<N>
  ) => PodmanFileConfig<Config, "quadlet", FileExtension>[];
};

/** Factory type for creating Podman resource builders */
export type PodmanResourceFactory<
  Config extends PodmanResourceConfig,
  FileExtension extends AllowedExtensions,
  UseResult = false
> = <const T extends readonly Config[]>(
  configs: UniqueObjectKeyArray<T, "name">
) => PodmanResource<T[number], FileExtension, UseResult>;
