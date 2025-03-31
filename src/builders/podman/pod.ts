import type { Expand } from "$lib/internal/types.ts";
import type {
  Resource,
  ResourceConfig,
  DependencyOptions,
} from "$lib/builders/types.ts";
import type {
  PodmanContainer,
  PodmanContainerDependency,
} from "./container.ts";
import type { PodmanNetwork, PodmanNetworkDependency } from "./network.ts";
import type { PodmanVolume, PodmanVolumeDependency } from "./volume.ts";
import type { PortMapping, PortDependency } from "./types.ts";

/** Pod runtime dependencies */
type PodmanPodDependencies = Expand<
  PodmanNetworkDependency &
    PortDependency &
    PodmanVolumeDependency &
    PodmanContainerDependency
>;

// Base Pod config with required fields
type PodmanPodConfig = ResourceConfig<
  {
    description?: string;
  } & Partial<PodmanPodDependencies>
>;

/** Pod resource with runtime dependency management methods
 *
 * Runtime dependencies (networks, containers, ports, volumes) can be attached after creation.
 * A Pod must have a network and container attached before generating template.
 *
 * @template T Pod configuration type {@linkcode PodmanPodConfig}
 * @see {@linkcode createPod} For examples and usage
 */
/** Pod resource with runtime dependency management */
type PodmanPodResource<T extends PodmanPodConfig> = Expand<
  Resource<"pod", T> & {
    /** Add container to pod */
    addContainer: (
      container: PodmanContainer,
      opts?: DependencyOptions
    ) => PodmanPodResource<T>;
    /** Add network to pod */
    addToNetwork: (
      network: PodmanNetwork,
      opts?: DependencyOptions
    ) => PodmanPodResource<T>;
    /** Add volume mount */
    addVolume: (
      volume: PodmanVolume,
      opts?: DependencyOptions
    ) => PodmanPodResource<T>;
    /** Expose port on pod, and map it to internal port like a containers port */
    exposePort: (
      port: PortMapping,
      opts?: DependencyOptions
    ) => PodmanPodResource<T>;
    /** Get current runtime dependencies */
    getDependencies: () => PodmanPodDependencies;
  }
>;

type PodmanPod = PodmanPodResource<PodmanPodConfig>;

type PodmanPodRef = {
  readonly id: string;
  readonly type: "pod";
};

type PodmanPodDependency = {
  pod: PodmanPodRef | null;
};

const template = (
  config: PodmanPodConfig,
  dependencies: PodmanPodDependencies
) =>
  `
[Pod]
PodName=${config.id}
${[
  // Flatten network array into individual lines
  ...(dependencies.networks.length > 0
    ? dependencies.networks.map((n) => `Network=${n.config().id}.${n.type}`)
    : []),
  // Flatten ports array into individual lines
  ...(dependencies.ports.length > 0
    ? dependencies.ports.map((p) => `Port=${p.external}:${p.internal}`)
    : []),
  // Flatten volumes array into individual lines
  ...(dependencies.volumes.length > 0
    ? dependencies.volumes.map((v) => `Volume=${v.config().id}.${v.type}`)
    : []),
]
  .filter(Boolean)
  .join("\n")}`.trim();

/** Creates a Pod resource with runtime dependency management
 *
 * @param config Pod configuration
 * @returns A {@linkcode PodmanPodResource} with methods to attach runtime dependencies
 *
 * @example Pod creation
 * ```ts
 * const wordpress = createPod({
 *   id: "wordpress",
 *   description: "Wordpress pod with database and web server containers",
 * })
 * .attachNetwork({
 *    id: "my-network",
 *    subnet: "10.89.0.0/24",
 *    gateway: "10.89.0.1"
 * })
 * .exposePort({ external: 80, internal: 80 })
 * .exposePort({ external: 443, internal: 443 });
 * // In this case, port 80 and 443 are exposed to the
 * // host machine and map to the same internal ports
 * // on the pod
 * ```
 */
function createPod<const T extends PodmanPodConfig>(
  config: T
): PodmanPodResource<T> {
  const dependencies: PodmanPodDependencies = {
    networks: config.networks ?? [],
    containers: config.containers ?? [],
    ports: config.ports ?? [],
    volumes: config.volumes ?? [],
  };

  return {
    type: "pod",
    id: config.id,
    config: () => config,
    addToNetwork(network) {
      dependencies.networks.push(network);
      return this;
    },
    addContainer(container) {
      dependencies.containers.push(container);
      const _config = this.id;
      container._setPodRef({
        id: this.id,
        type: this.type,
      });
      return this;
    },
    exposePort(port) {
      dependencies.ports.push(port);
      return this;
    },
    addVolume(volume) {
      dependencies.volumes.push(volume);
      return this;
    },
    getDependencies() {
      return dependencies;
    },
    generateFileTemplate() {
      if (
        dependencies.networks.length === 0 &&
        dependencies.containers.length === 0
      ) {
        throw new Error(
          `Pod ${config.id} must have at least 1 network and 1 container attached`
        );
      }
      return template(config, dependencies);
    },
  };
}

export { createPod };
export type { PodmanPod, PodmanPodDependency, PodmanPodConfig };
