import { Color } from "../common/color/color";
import { ShaderProgram } from "../common/program";
import { shadersMap } from "../common/shader";
import { MaterialType } from "./type";

export interface MaterialConfig {
  type: number;
  color: string | number | Color;
  shininess?: number;
  specular?: string | number | Color;
}

export class Material {
  private shaderProgram: ShaderProgram | undefined = undefined;
  private _color: Color;
  private _specular?: Color;
  private config: MaterialConfig;

  constructor(config: MaterialConfig) {
    this.config = config;
    if (config.color instanceof Color) {
      this._color = config.color;
    } else {
      this._color = new Color(config.color);
    }
    if (config.type === MaterialType.Phong && config.specular != null) {
      if (config.specular instanceof Color) {
        this._specular = config.specular;
      } else {
        this._specular = new Color(config.specular);
      }
    }
  }

  get color(): Color {
    return this._color;
  }

  set color(value: Color) {
    this._color = value;
  }

  get specular(): Color | undefined {
    return this._specular;
  }

  set specular(value: Color | undefined) {
    this._specular = value;
  }

  /** 确保已创建并与 `gl` 关联的 ShaderProgram（不切换当前 program） */
  ensureShaderProgram(gl: WebGLRenderingContext): ShaderProgram {
    if (!this.shaderProgram) {
      const { vertex, fragment } = shadersMap[this.config.type];
      this.shaderProgram = ShaderProgram.create(gl, vertex, fragment);
    }
    return this.shaderProgram;
  }

  attach(gl: WebGLRenderingContext, skipUseProgram = false): void {
    const sp = this.ensureShaderProgram(gl);
    if (!skipUseProgram) sp.useProgram();
    const locColor = sp.getUniformLocation("u_material.color");
    if (locColor) gl.uniform3fv(locColor, this._color.toArray());
    if (this.config.type === MaterialType.Phong && this.config.shininess != null) {
      const locShininess = sp.getUniformLocation("u_material.shininess");
      if (locShininess) gl.uniform1f(locShininess, this.config.shininess);
      const locSpecular = sp.getUniformLocation("u_materialSpecular");
      if (locSpecular && this._specular) gl.uniform3fv(locSpecular, this._specular.toArray());
    }
  }

  getShaderProgram(): ShaderProgram | null {
    return this.shaderProgram ?? null;
  }
}
