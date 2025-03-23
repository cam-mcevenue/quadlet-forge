import { z } from "npm:zod";

const distros = z.enum(["ubuntu", "debian", "fedora-coreos"]);
const username = z
  .string()
  .min(2, "Username must be at least 2 characters long")
  .refine((val) => val === val.toLowerCase(), {
    message: "User name's must be lowercase",
  });

export type Config = z.infer<typeof configSchema>;
export const configSchema = z.object({
  distro: distros,
  user: username,
});
