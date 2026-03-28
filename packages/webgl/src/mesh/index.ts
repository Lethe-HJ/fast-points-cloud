import { m4, type Mat4 } from "../common/math/matrix/matrix4";
import { BaseObject } from "../common/object/base";
import type { Geometry } from "../geometry/base";
import type { Material } from "../material/base";
import type { Group } from "../group/type";
import type { Camera } from "../camera/type";
import { ObjectType } from "../common/object/type";
import type { BoundingSphere } from "../utils/culling/frustum";
import { MeshMatrixSet } from "./type";

export class Mesh extends BaseObject {
  name: typeof ObjectType.Mesh;
  geometry: Geometry;
  material: Material;
  parent: Group | null;
  matrixes: MeshMatrixSet;

  constructor(geometry: Geometry, material: Material) {
    super(ObjectType.Mesh);
    this.name = ObjectType.Mesh;
    this.geometry = geometry;
    this.material = material;
    this.parent = null;
    this.matrixes = {
      mvp: { value: null, location: null },
      model: { value: null, location: null },
      normal: { value: null, location: null },
      rotation: m4.identity(),
      translate: m4.identity(),
      scale: m4.identity(),
      localModel: m4.identity(),
    };
  }

  attach(gl: WebGLRenderingContext, skipUseProgram = false): void {
    this.material.attach(gl, skipUseProgram);
    const sp = this.material.getShaderProgram();
    if (!sp) throw new Error("Mesh: shader program is null");
    if (!skipUseProgram) sp.useProgram();
    this.matrixes.mvp.location = sp.getUniformLocation("u_mvpMatrix");
    this.matrixes.model.location = sp.getUniformLocation("u_modelMatrix");
    this.matrixes.normal.location = sp.getUniformLocation("u_normalMatrix");
    this.geometry.attach(gl, sp);
  }

  updateModelMatrix(): void {
    // 从 Vector3 更新矩阵
    this.matrixes.translate = m4.translation(this.position.x, this.position.y, this.position.z);
    this.matrixes.rotation = m4.multiplySeries(
      m4.identity(),
      m4.xRotation(this.rotation.x),
      m4.yRotation(this.rotation.y),
      m4.zRotation(this.rotation.z),
    );
    this.matrixes.scale = m4.scaling(this.scale.x, this.scale.y, this.scale.z);

    const parentModel = this.parent ? this.parent.matrixes.model : null;
    this.matrixes.localModel = m4.multiplySeries(
      this.matrixes.translate,
      this.matrixes.rotation,
      this.matrixes.scale,
    );
    this.matrixes.model.value = parentModel
      ? m4.multiply(parentModel, this.matrixes.localModel)
      : this.matrixes.localModel;
  }

  updateMatrix(gl: WebGLRenderingContext, camera: Camera): void {
    const modelMatrix = this.matrixes.model.value!;
    const mvpMatrix = m4.multiply(camera.matrix.vp, modelMatrix);
    this.matrixes.mvp.value = mvpMatrix;
    const normalMatrix = m4.transpose(m4.inverse(modelMatrix));
    this.matrixes.normal.value = normalMatrix;
    const toF32 = (m: Mat4) => (m instanceof Float32Array ? m : new Float32Array(m));
    if (this.matrixes.model.location)
      gl.uniformMatrix4fv(this.matrixes.model.location, false, toF32(modelMatrix));
    if (this.matrixes.mvp.location)
      gl.uniformMatrix4fv(this.matrixes.mvp.location, false, toF32(mvpMatrix));
    if (this.matrixes.normal.location)
      gl.uniformMatrix4fv(this.matrixes.normal.location, false, toF32(normalMatrix));
  }

  getWorldBoundingSphere(): BoundingSphere {
    const localSphere = this.geometry.getBoundingSphere();
    const model = this.matrixes.model.value ?? m4.identity();
    const [x, y, z] = localSphere.center;
    const worldCenter: [number, number, number] = [
      x * model[0] + y * model[4] + z * model[8] + model[12],
      x * model[1] + y * model[5] + z * model[9] + model[13],
      x * model[2] + y * model[6] + z * model[10] + model[14],
    ];

    const sx = Math.hypot(model[0], model[1], model[2]);
    const sy = Math.hypot(model[4], model[5], model[6]);
    const sz = Math.hypot(model[8], model[9], model[10]);
    const scale = Math.max(sx, sy, sz);

    return {
      center: worldCenter,
      radius: localSphere.radius * scale,
    };
  }

  setRotation(xDeg: number, yDeg: number, zDeg: number): this {
    this.rotation.set(xDeg, yDeg, zDeg);
    return this;
  }

  setPosition(x: number, y: number, z: number): this {
    this.position.set(x, y, z);
    return this;
  }

  setScale(x: number, y: number, z: number): this {
    this.scale.set(x, y, z);
    return this;
  }
}

export { type MeshMatrixSet } from "./type";
