export type DistroHomeDir = typeof DISTRO_HOME_DIR;
export const DISTRO_HOME_DIR = {
  ubuntu: "/home",
  debian: "/home",
  coreos: "/var/home",
} as const;

export type PathMap = typeof PATHS;
export const PATHS = {
  user_quadlet: ".config/containers/systemd",
  user_systemd: ".config/systemd/user",
} as const;
