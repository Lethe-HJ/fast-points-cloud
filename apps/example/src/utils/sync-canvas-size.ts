import type {
  PerspectiveCamera as ThreePerspectiveCamera,
  WebGLRenderer as ThreeWebGLRenderer,
} from "three";
import type {
  PerspectiveCamera as MiniPerspectiveCamera,
  WebGLRenderer as MiniWebGLRenderer,
} from "@mini-three/webgl";

/** Three.js：CSS 尺寸填满容器时，同步 drawing buffer、viewport 与透视投影宽高比 */
export function syncThreeCanvasSize(
  canvas: HTMLCanvasElement,
  renderer: ThreeWebGLRenderer,
  camera: ThreePerspectiveCamera,
): void {
  const w = canvas.clientWidth;
  const h = Math.max(canvas.clientHeight, 1);
  if (w <= 0) return;
  const dpr = window.devicePixelRatio || 1;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
}

/** mini-three WebGL：依赖 `setPixelRatio` 根据 client 尺寸更新画布与 viewport，并更新相机投影 */
export function syncMiniThreeCanvasSize(
  canvas: HTMLCanvasElement,
  renderer: MiniWebGLRenderer,
  camera: MiniPerspectiveCamera,
): void {
  const w = canvas.clientWidth;
  const h = Math.max(canvas.clientHeight, 1);
  if (w <= 0) return;
  const dpr = window.devicePixelRatio || 1;
  camera.aspect = w / h;
  camera.updateMatrix();
  renderer.setPixelRatio(dpr);
}
