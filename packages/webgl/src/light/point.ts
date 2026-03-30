import type { ShaderProgram } from "../common/program";
import { Color } from "../common/color/color";
import { Vector3 } from "../common/math/vector/vector3";
import { Brand } from "../utils/type/brand";
import { glsl } from "../common/shader/base";

export class PointLight {
  name: "PointLight";
  private _position: Vector3;
  private _color: Color;
  private _intensity: number;
  private _distance: number;
  private _decay: number;
  private _attenuation: [number, number, number];

  constructor(
    color: string | number,
    intensity: number = 1,
    distance: number = 0,
    decay: number = 0,
  ) {
    this.name = "PointLight";
    this._position = new Vector3();
    this._color = new Color(color);
    this._intensity = intensity;
    this._distance = distance;
    this._decay = decay;
    this._attenuation = [1, 0, 0]; // 默认为无衰减
  }

  get position(): Vector3 {
    return this._position;
  }

  set position(value: Vector3) {
    this._position = value;
  }

  get color(): Color {
    return this._color;
  }

  set color(value: Color) {
    this._color = value;
  }

  get intensity(): number {
    return this._intensity;
  }

  set intensity(value: number) {
    this._intensity = value;
  }

  get distance(): number {
    return this._distance;
  }

  set distance(value: number) {
    this._distance = value;
  }

  get decay(): number {
    return this._decay;
  }

  set decay(value: number) {
    this._decay = value;
  }

  setPosition(x: number, y: number, z: number): this {
    this._position.set(x, y, z);
    return this;
  }

  setColor(color: string | number): this {
    this._color = new Color(color);
    return this;
  }

  setIntensity(intensity: number): this {
    this._intensity = intensity;
    return this;
  }

  setDistance(distance: number): this {
    this._distance = distance;
    return this;
  }

  setDecay(decay: number): this {
    this._decay = decay;
    return this;
  }

  attach(gl: WebGL2RenderingContext, sp: ShaderProgram): void {
    const locPos = sp.getUniformLocation(U_PointLight.Position);
    const locColor = sp.getUniformLocation(U_PointLight.Color);
    const locConst = sp.getUniformLocation(U_PointLight.Constant);
    const locLinear = sp.getUniformLocation(U_PointLight.Linear);
    const locQuadratic = sp.getUniformLocation(U_PointLight.Quadratic);
    const locIntensity = sp.getUniformLocation(U_PointLight.Intensity);
    if (locPos) {
      gl.uniform3fv(locPos, this._position.toArray());
      if (__LOG__) console.log(`[PointLight] gl.uniform3fv`);
    }
    if (locColor) {
      gl.uniform3fv(locColor, this._color.toArray());
      if (__LOG__) console.log(`[PointLight] gl.uniform3fv`);
    }
    if (locConst) {
      gl.uniform1f(locConst, this._attenuation[0]);
      if (__LOG__) console.log(`[PointLight] gl.uniform1f`);
    }
    if (locLinear) {
      gl.uniform1f(locLinear, this._attenuation[1]);
      if (__LOG__) console.log(`[PointLight] gl.uniform1f`);
    }
    if (locQuadratic) {
      gl.uniform1f(locQuadratic, this._attenuation[2]);
      if (__LOG__) console.log(`[PointLight] gl.uniform1f`);
    }
    if (locIntensity) {
      gl.uniform1f(locIntensity, this._intensity);
      if (__LOG__) console.log(`[PointLight] gl.uniform1f`);
    }
  }
}

export type UniformName = Brand<string, "UniformName">;

/**
 *  NOTE 命名约定：
 * 1. _U_* 表示文件内部使用的 Uniform 变量名称
 * 2. _U__* 表示 Uniform 变量名称的子项
 * 3. U_* 表示对外暴露的 Uniform 变量名称
 */

/**
 * u_pointLight - 点光源结构体名称
 */
const _U_PointLight = "u_pointLight" as UniformName;

/**
 * position - 点光源位置
 */
const _U__Position = "position" as UniformName;
/**
 * color - 点光源颜色
 */
const _U__Color = "color" as UniformName;
/**
 * constant - 点光源常数项
 */
const _U__Constant = "constant" as UniformName;
/**
 * linear - 点光源线性项
 */
const _U__Linear = "linear" as UniformName;
/**
 * quadratic - 点光源二次项
 */
const _U__Quadratic = "quadratic" as UniformName;
/**
 * intensity - 点光源强度
 */
const _U__Intensity = "intensity" as UniformName;

/**
 * 点光源结构体子项枚举值
 */
export const U_PointLight = {
  /**
   * u_pointLight.position - 点光源位置
   */
  Position: `${_U_PointLight}.${_U__Position}` as UniformName,
  /**
   * u_pointLight.color - 点光源颜色
   */
  Color: `${_U_PointLight}.${_U__Color}` as UniformName,
  /**
   * u_pointLight.constant - 点光源常数项
   */
  Constant: `${_U_PointLight}.${_U__Constant}` as UniformName,
  /**
   * u_pointLight.linear - 点光源线性项
   */
  Linear: `${_U_PointLight}.${_U__Linear}` as UniformName,
  /**
   * u_pointLight.quadratic - 点光源二次项
   */
  Quadratic: `${_U_PointLight}.${_U__Quadratic}` as UniformName,
  /**
   * u_pointLight.intensity - 点光源强度
   */
  Intensity: `${_U_PointLight}.${_U__Intensity}` as UniformName,
} as const;

export type _U_PointLight = (typeof U_PointLight)[keyof typeof U_PointLight];

/**
 * 点光源结构体定义代码
 * 点光源结构体实例化代码
 * ```glsl
 *   struct PointLight {
 *     vec3 color;
 *     vec3 position;
 *     float constant;
 *     float linear;
 *     float quadratic;
 *     float intensity;
 *   };
 *   uniform PointLight u_pointLight;
 * ```
 */
export const pointLightDefineCodeSource = glsl`
  // 点光源结构体
  struct PointLight {
    vec3 ${_U__Color};
    vec3 ${_U__Position};
    float ${_U__Constant};
    float ${_U__Linear};
    float ${_U__Quadratic};
    float ${_U__Intensity};
  };
  uniform PointLight ${_U_PointLight};
`;
