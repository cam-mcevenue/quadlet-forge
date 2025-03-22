import { z } from "npm:zod";

const distros = z.enum(["ubuntu", "debian", "fedora-coreos"]);

export type Config = z.infer<typeof configSchema>;
export const configSchema = z.object({
  distro: distros,
});
