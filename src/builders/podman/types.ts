/** Ports to expose on the container or pod */
export type PortMapping = {
  /** Port on the host machine or pod (if container within a pod) */
  external: number;
  /** Internal port on the container or pod to map the external port to */
  internal: number;
};

export type PortDependency = {
  ports: PortMapping[];
};
