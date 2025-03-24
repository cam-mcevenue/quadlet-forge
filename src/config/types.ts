/** Supported linux distributions */
export type Distros = "centos" | "coreos" | "debian" | "ubuntu";

/** User name */
export type UserName = string;

/** Quadlet file configurations for a user */
type QuadletGeneratorUserConfig = {
  containers?: string[];
  pods?: string[];
};

/** Configuration options for file generation function */
export type QuadletGeneratorConfig = {
  /** The linux distribution to generate artificats for. Affects directory structure.*/
  distro: Distros;
  /** Object of users for the file generator.
   * The key will be the user name and the value will be the user configuration.
   * This will place files in their appropriate user home directories
   *
   * **NOTE:** User names will be converted to lowercase
   */
  users: Record<UserName, QuadletGeneratorUserConfig>;
  /** The directory to write the files.
   *
   * If `undefined` no files will be written.
   */
  outputDir?: string;
};

export type ButaneUserConfig = {
  /** Whether the user should have sudo privileges */
  sudo: boolean;
  /** List of SSH public keys to add to the user's authorized_keys file
   *
   * > [!IMPORTANT]
   * > **DO NOT** put `private keys` here
   */
  ssh_authorized_keys: string[];
  /** Groups to add the user to
   *
   * **NOTE:** The groups `sudo` and `wheel` will be ignored. Use the `sudo` prop instead.
   */
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
  /**
   * Files to be generated for the user.
   *
   * **NOTE:** These will be owned by the user and their group namespace.
   */
  files: string[];
  podman?: QuadletGeneratorConfig;
};

/** Supported butane specifications
 *
 * [Butane Configs](https://coreos.github.io/butane/specs/) must conform to a specific `variant` and `version` of the Butane schema,
 * specified with the variant and version fields in the configuration.
 */
type ButaneSpcification =
  | {
      variant: "fcos";
      version:
        | "1.6.0"
        | "1.5.0"
        | "1.4.0"
        | "1.3.0"
        | "1.2.0"
        | "1.1.0"
        | "1.0.0";
    }
  | {
      variant: "flatcar";
      version: "1.0.0" | "1.1.0";
    }
  | {
      variant: "openshift";
      version:
        | "4.17.0"
        | "4.16.0"
        | "4.15.0"
        | "4.14.0"
        | "4.13.0"
        | "4.12.0"
        | "4.11.0"
        | "4.10.0"
        | "4.9.0"
        | "4.8.0";
    }
  | {
      variant: "r4e";
      version: "1.1.0" | "1.0.0";
    }
  | {
      variant: "fiot";
      version: "1.0.0";
    };

/** Configuration object for the butane file generator */
export type ButaneGeneratorConfig = {
  specification: ButaneSpcification;
  /** Users to be generated on the linux server, and their configurations.
   *
   *
   * **NOTE:**
   * * The key will be the user name
   * * User names will be converted to lowercase
   */
  users: Record<UserName, ButaneUserConfig>;
};
