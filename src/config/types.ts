/** Supported linux distributions */
export type Distros = "coreos";

export type UserName = string;

/** Configuration object for a user to be created on the linux server.
 *
 * @example
 * ```typescript
 * const userConfig = {
 *      sudo: true,
 *      ssh_public_keys: [
 *           "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCqXJ7
 *      ],
 *      groups: ["wheel", "sudo"],
 *      podman_containers: ["nginx"],
 *      podman_pods: ["nginx-pod"]
 * }
 * ```
 */
export type UserConfig = {
  /** Whether the user should have sudo privileges */
  sudo: boolean;
  /** List of SSH public keys to add to the user's authorized_keys file
   *
   * **WARNING:** DO NOT as private keys here
   */
  ssh_public_keys?: string[];
  /** Groups to add the user to */
  groups?: string[];
  /** Whether the users services should be started on boot and
   * persist after the user logs out.
   *
   * **NOTE:** By default all users will have linger enabled
   * set this to `true` if you would like to disable lingering
   * for the user. Be aware containers and pods will be stopped
   * when the user logs out.
   *
   */
  disableLinger?: true;
  /** Containers the user will own and their configs */
  podman_containers?: string[];
  /** Pods the user will own and their configs */
  podman_pods?: string[];
};

/** Configuration object for the linux server */
export type Config = {
  /** The linux distribution to generate artificats for. Affect directories generated.*/
  distro: Distros;
  /** Users to be generated on the linux server, and their configurations.
   * They key will be the user name and the value will be the user configuration.
   *
   * **NOTE:** User names will be converted to lowercase */
  users: Record<UserName, UserConfig>;
};
