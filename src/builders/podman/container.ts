import type { Expand } from "$lib/internal/types.ts";
import type {
  Resource,
  ResourceConfig,
  DependencyOptions,
} from "$lib/builders/types.ts";
import type { PodmanPod, PodmanPodDependency } from "./pod.ts";
import type { PortMapping, PortDependency } from "./types.ts";
import type { PodmanNetwork, PodmanNetworkDependency } from "./network.ts";
import type { PodmanVolume, PodmanVolumeDependency } from "./volume.ts";

/** Configuration object for podman .container file */
export type PodmanContainerDependencies = Expand<
  PodmanPodDependency &
    PodmanNetworkDependency &
    PortDependency &
    PodmanVolumeDependency
>;

// Base container config with required fields
type PodmanContainerConfig = ResourceConfig<
  {
    image: string;
    description?: string;
  } & Partial<Omit<PodmanContainerDependencies, "pod">>
>;

/** Container resource with runtime dependency management methods
 *
 * Runtime dependencies (networks/pod, ports, volumes) can be attached after creation.
 * A container must have either networks or a pod attached before generating template.
 *
 * @template T Container configuration type {@linkcode PodmanContainerConfig}
 * @see {@linkcode createContainer} For examples and usage
 */
type PodmanContainerResource<T extends PodmanContainerConfig> = Expand<
  Resource<"container", T> & {
    /** Add container to a pod
     * @internal Don't use directly, use {@linkcode PodmanPod.addContainer} instead
     */
    _setPodRef: (pod: PodmanPodDependency["pod"]) => PodmanContainerResource<T>;
    /** Add container to a network */
    addToNetwork: (
      network: PodmanNetwork,
      opts?: DependencyOptions
    ) => PodmanContainerResource<T>;

    /** Add a volume to the container */
    addVolume: (
      volume: PodmanVolume,
      opts?: DependencyOptions
    ) => PodmanContainerResource<T>;
    /** Map an external port on the host or parent pod to an internal port on the container */
    exposePort: (
      port: PortMapping,
      opts?: DependencyOptions
    ) => PodmanContainerResource<T>;
    /** Get all the current dependencies of the container  */
    getDependencies: () => PodmanContainerDependencies;
  }
>;

type PodmanContainer = PodmanContainerResource<PodmanContainerConfig>;

type PodmanContainerDependency = {
  containers: PodmanContainer[];
};

const template = (
  config: PodmanContainerConfig,
  dependencies: PodmanContainerDependencies
) =>
  `
[Container]
ContainerName=${config.id}
Image=${config.image}
${[
  // Flatten network array into individual lines
  ...(dependencies.networks.length > 0
    ? dependencies.networks.map((n) => `Network=${n.config().id}.${n.type}`)
    : []),
  // Pod is already a single value
  ...(dependencies.pod
    ? [`Pod=${dependencies.pod}.${dependencies.pod.type}`]
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

/** Creates a container resource with runtime dependency management
 *
 * @param config {@linkcode PodmanContainerConfig} configuration object
 * @returns A {@linkcode PodmanContainerResource} with methods to attach runtime dependencies
 *
 * @example Create a container
 * ```ts
 * const caddy = createContainer({
 *   id: "caddy",
 *   image: "docker.io/caddy:latest"
 *   description: "Caddy web server"
 * })
 * .attachPort({ external: 80, internal: 80 });
 * .attachPort({ external: 443, internal: 443 });
 * ```
 */
function createContainer<const T extends PodmanContainerConfig>(
  config: T
): PodmanContainerResource<T> {
  const dependencies: PodmanContainerDependencies = {
    networks: config.networks ?? [],
    pod: null,
    ports: config.ports ?? [],
    volumes: config.volumes ?? [],
  };

  return {
    type: "container",
    id: config.id,
    config: () => config,
    _setPodRef(pod) {
      if (dependencies.networks.length > 0) {
        throw new Error("Cannot attach pod to a container with networks");
      }
      dependencies.pod = pod;
      return this;
    },
    addToNetwork(network) {
      if (dependencies.pod) {
        throw new Error("Cannot attach networks to a container in a pod");
      }
      dependencies.networks.push(network);
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
      if (dependencies.networks.length === 0 && !dependencies.pod) {
        throw new Error(
          `Container ${config.id} must have either networks or pod attached`
        );
      }
      return template(config, dependencies);
    },
  };
}

export { createContainer };
export type {
  PodmanContainer,
  PodmanContainerConfig,
  PodmanContainerDependency,
};
