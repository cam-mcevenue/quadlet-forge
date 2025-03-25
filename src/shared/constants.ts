export type DistroHomeDir = typeof DISTRO_HOME_DIR;
export const DISTRO_HOME_DIR = {
  ubuntu: "/home",
  debian: "/home",
  coreos: "/var/home",
} as const;

export type PodmanPathMap = typeof PODMAN_PATHS;
export const PODMAN_PATHS = {
  quadlet: ".config/containers/systemd",
  systemd: ".config/systemd/user",
} as const;
