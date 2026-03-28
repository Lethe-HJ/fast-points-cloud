import { type Mat4 } from "../common/math/matrix/matrix4";

export interface MeshMatrixSet {
  mvp: { value: Mat4 | null; location: WebGLUniformLocation | null };
  model: { value: Mat4 | null; location: WebGLUniformLocation | null };
  normal: { value: Mat4 | null; location: WebGLUniformLocation | null };
  rotation: Mat4;
  translate: Mat4;
  scale: Mat4;
  localModel: Mat4;
}
