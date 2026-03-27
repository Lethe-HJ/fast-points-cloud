import type { Mat4 } from "../../common/math/matrix/matrix4";

export interface BoundingSphere {
  center: [number, number, number];
  radius: number;
}

export interface BoundingAABB {
  min: [number, number, number];
  max: [number, number, number];
}

interface Plane {
  nx: number;
  ny: number;
  nz: number;
  d: number;
}

export class Frustum {
  private planes: Plane[] = [];

  setFromProjectionMatrix(vpMatrix: Mat4): this {
    const m = vpMatrix;
    this.planes = [
      this.normalizePlane(m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]), // left
      this.normalizePlane(m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]), // right
      this.normalizePlane(m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]), // bottom
      this.normalizePlane(m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]), // top
      this.normalizePlane(m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]), // near
      this.normalizePlane(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]), // far
    ];
    return this;
  }

  intersectsSphere(sphere: BoundingSphere): boolean {
    for (let i = 0; i < this.planes.length; i++) {
      const plane = this.planes[i];
      const distance =
        plane.nx * sphere.center[0] +
        plane.ny * sphere.center[1] +
        plane.nz * sphere.center[2] +
        plane.d;
      if (distance < -sphere.radius) {
        return false;
      }
    }
    return true;
  }

  intersectsAABB(_aabb: BoundingAABB): boolean {
    // TODO: 第二阶段补齐 AABB 与平面相交测试
    return true;
  }

  private normalizePlane(nx: number, ny: number, nz: number, d: number): Plane {
    const len = Math.hypot(nx, ny, nz);
    if (len === 0) {
      return { nx, ny, nz, d };
    }
    return {
      nx: nx / len,
      ny: ny / len,
      nz: nz / len,
      d: d / len,
    };
  }
}
