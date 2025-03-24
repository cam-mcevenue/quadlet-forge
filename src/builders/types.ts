import type { Expand } from "$lib/internal/types.ts";

type FileBase = {
  readonly file_name: string;
  readonly output_dir_local: string;
};

export type TemplateFile = Expand<
  FileBase & {
    readonly contents: string;
  }
>;

type ButaneInlineFile = Expand<
  FileBase & {
    readonly output_dir_remote: string;
    readonly contents_inline: string;
  }
>;

type ButaneRemoteFile = Expand<
  Omit<ButaneInlineFile, "contents_inline"> & {
    readonly contents_remote: string;
  }
>;

export type ButaneFile = ButaneInlineFile | ButaneRemoteFile;
