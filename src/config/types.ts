export type Distros = "coreos";
export type UserName = string;

export type UserConfig = {
  /** Whether the user should have sudo privileges */
  sudo: boolean;
  /**
   * List of SSH public keys to add to the user's authorized_keys file
   *
   * **WARNING:** DO NOT as private keys here
   */
  ssh_public_keys?: string[];
  /** List of groups to add the user to. 
   * 
  /** Groups to add the user to */
  groups?: string[];
  /**
   * Whether the users services should be started on boot and
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

export type Config = {
  distro: Distros;
  /**
   * Key will be the username
   *
   * **NOTE:** User names will be converted to lowercase */
  users: Record<UserName, UserConfig>;
};
