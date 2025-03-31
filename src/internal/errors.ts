import { ResourceTypes } from "$lib/builders/types.ts";
import { capitalize } from "./text.ts";

export function createError(code: string, message: string) {
  const error = new Error(`${code}\n${message}`);
  error.name = "QuadletForgeError";
  return error;
}

export function errorDuplicateResource(type: ResourceTypes, id: string) {
  throw createError(
    `duplicate_${type}`,
    `${capitalize(type)} "${id}" already exists`
  );
}

//  Network Errors
export function errorNetworkDuplicateName(networkId: string) {
  throw createError(
    "network_duplicate_name",
    `Network "${networkId}" already exists`
  );
}

// TODO: Uncomment and implement these functions when we add more advanced network features
// export function errorNetworkOverlappingSubnet(networkId: string, existingId: string, subnet: string) {
//   throw createError(
//     "network_overlapping_subnet",
//     `Network "${networkId}" subnet "${subnet}" overlaps with network "${existingId}"`
//   );
// }

// export function errorNetworkGatewayOutOfRange(networkId: string, gateway: string, subnet: string) {
//   throw createError(
//     "network_gateway_out_of_range",
//     `Network "${networkId}" gateway "${gateway}" must be within subnet "${subnet}"`
//   );
// }

// export function errorNetworkGatewayWithoutSubnet(networkId: string, gateway: string) {
//   throw createError(
//     "network_gateway_without_subnet",
//     `Network "${networkId}" has gateway "${gateway}" but no subnet - Gateway requires subnet to be specified`
//   );
// }
// END: Network Errors

// Container Errors
export function errorContainerNetworkInPod(
  containerId: string,
  podId: string,
  networkId: string
) {
  throw createError(
    "container_network_in_pod",
    `Container "${containerId}" can't join network "${networkId}" - It's part of pod "${podId}". Use pod networking instead`
  );
}

export function errorContainerDuplicateNetwork(
  containerId: string,
  networkId: string
) {
  throw createError(
    "container_duplicate_network",
    `Container "${containerId}" is already connected to network "${networkId}"`
  );
}

export function errorContainerDuplicatePort(containerId: string, port: number) {
  throw createError(
    "container_duplicate_port",
    `Container "${containerId}" is trying to expose port "${port}" multiple times`
  );
}

export function errorContainerVolumeMountConflict(
  containerId: string,
  volumeId: string,
  target: string,
  existingType: "private" | "shared"
) {
  throw createError(
    "container_volume_mount_conflict",
    `Container "${containerId}" - Volume "${volumeId}" mount at "${target}" conflicts with existing ${existingType} mount`
  );
}

export function errorContainerPortConflictInPod(
  containerId: string,
  podId: string,
  port: number
) {
  throw createError(
    "container_port_conflict_in_pod",
    `Container "${containerId}" - Port "${port}" already in use by another container in pod "${podId}"`
  );
}
// END: Container Errors

// Volume Errors
export function errorVolumePermissionConflict(
  volumeId: string,
  newPermission: string,
  existingPermission: string
) {
  throw createError(
    "volume_permission_conflict",
    `Volume "${volumeId}" cannot be mounted as "${newPermission}" - Already mounted as "${existingPermission}"`
  );
}
// END: Volume Errors

// Pod Errors
export function errorPodDuplicatePort(podId: string, port: number) {
  throw createError(
    "pod_duplicate_port",
    `Pod "${podId}" is already exposing port "${port}"`
  );
}

export function errorPodPortInUse(
  podId: string,
  port: number,
  containerId: string
) {
  throw createError(
    "pod_port_in_use",
    `Pod "${podId}" - Port "${port}" already in use by container "${containerId}"`
  );
}
// END: Pod Errors
