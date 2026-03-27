const WEBGPU_NOT_IMPLEMENTED_MESSAGE =
  "mini-three/webgpu is not implemented yet. Please use mini-three/webgl for now.";

/**
 * Temporary placeholder for WebGPU support.
 * This keeps the subpath import stable before the real implementation lands.
 */
export class WebGPURenderer {
  constructor() {
    throw new Error(WEBGPU_NOT_IMPLEMENTED_MESSAGE);
  }
}

export function createWebGPUNotImplementedError(): Error {
  return new Error(WEBGPU_NOT_IMPLEMENTED_MESSAGE);
}
