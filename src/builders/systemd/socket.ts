import type { Resource, ResourceConfig } from "$lib/builders/types.ts";
import type { PortMapping } from "$lib/builders/podman/types.ts";
import type { UniqueObjectKeyArray } from "$lib/internal/types.ts";

/** Configuration object for podman .network file */
type SocketConfig = ResourceConfig<{
  /** Name of the systemd service the socket activates
   *
   * Should be just the name of the service, without the `.service` extension.
   */
  readonly activate_service: string;
  /** List of ports the socket will listen on */
  readonly ports: number[];
}>;

/** Typed network returned from {@linkcode createSocket} */
type Socket = Resource<"socket", SocketConfig>;

/** Template to generate dynamic systemd .socket unit files
 * @param config - A {@linkcode SocketConfig} object
 * @returns The generated `.network` file contents
 */
const template = (config: SocketConfig) =>
  `
[Socket]
${[...config.ports.map((n) => `ListenStream=[::]${n}`)]}
# Allows IPv4 and IPv6 connections
BindIPv6Only=both
# This triggers the service immediately when socket is activated
Service=${config.activate_service}

[Install]
WantedBy=socket.target
`.trim();

/** Creates `podman network` with quadlet template generation method
 *
 * @param config Network configuration
 * @returns A {@linkcode Resource} object with `config` type {@linkcode PodmanNetworkConfig}
 *
 * @example Create a network
 * ```ts
 * const appNetwork = createNetwork({
 *   id: "app",
 *   subnet: "10.89.0.0/24",
 *   gateway: "10.89.0.1"
 * });
 * ```
 */
function createSocket<const T extends SocketConfig>(
  config: T
): Resource<"socket", T> {
  return {
    type: "socket",
    id: config.id,
    config: () => config,
    generateFileTemplate: () => template(config),
  };
}

export { createSocket };
export type { Socket, SocketConfig };
