import type { Expand } from "$lib/internal/types.ts";

export type PodmanResourceTypes = "container" | "pod" | "volume" | "network";
export type SystemdResourceTypes = "socket";
export type RuntimeDependencyTypes = Expand<PodmanResourceTypes | "port">;
export type ResourceTypes = Expand<SystemdResourceTypes | PodmanResourceTypes>;

/** Resource configuration type that enforces:
 * - All properties are readonly for immutability
 * - Required 'id' property for resource identification
 * - Preserves literal types for better type inference
 * - Allows extending with custom properties via generic parameter
 *
 * @example
 * ```ts
 * type NetworkConfig = PodmanResourceConfig<{
 *   subnet: string;
 *   gateway: string;
 * }>;
 *
 * // Results in:
 * {
 *   readonly id: string;
 *   readonly subnet: string;
 *   readonly gateway: string;
 * }
 * ```
 */
export type ResourceConfig<T extends Record<string, unknown> = {}> = Expand<
  {
    readonly id: string;
  } & Readonly<T>
>;

/** Return type for create<Resource> functions */
export type Resource<
  Type extends ResourceTypes,
  T extends ResourceConfig
> = Expand<
  {
    readonly type: Type;
    readonly id: T["id"];
  } & {
    config: () => T;
    generateFileTemplate: () => string;
  }
>;

export type DependencyOptions = {
  /** Whether to replace or append to existing dependencies of the resource type
   * @default false
   */
  overwrite?: boolean;
};

type FileTemplateBase<
  Name extends string,
  Extension extends string,
  Path extends string
> = {
  readonly file_name: Extension extends "" ? `${Name}` : `${Name}.${Extension}`;
  readonly output_dir_local: Path;
};

export type FileTemplate<
  Name extends string,
  Extension extends string,
  Path extends string
> = Expand<
  FileTemplateBase<Name, Extension, Path> & {
    readonly contents: string;
  }
>;

type ButaneInlineFile<
  Name extends string,
  Extension extends string,
  LocalPath extends string,
  RemotePath extends string
> = Expand<
  FileTemplateBase<Name, Extension, LocalPath> & {
    readonly output_dir_remote: RemotePath;
    readonly contents_inline: string;
  }
>;

/** Butane file with remote contents */
type ButaneRemoteFile<
  Name extends string,
  Extension extends string,
  LocalPath extends string,
  RemotePath extends string
> = Expand<
  Omit<
    ButaneInlineFile<Name, Extension, LocalPath, RemotePath>,
    "contents_inline"
  > & {
    readonly contents_remote: string;
  }
>;

/** Union type for all Butane file types */
export type ButaneFile<
  Name extends string,
  Extension extends string,
  LocalPath extends string,
  RemotePath extends string
> =
  | ButaneInlineFile<Name, Extension, LocalPath, RemotePath>
  | ButaneRemoteFile<Name, Extension, LocalPath, RemotePath>;
