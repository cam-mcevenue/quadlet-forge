import type { Expand } from "$lib/internal/types.ts";

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
