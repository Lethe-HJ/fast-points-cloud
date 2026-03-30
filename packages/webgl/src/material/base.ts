import { ShaderSource } from "../common/shader";
import { Color } from "../common/color/color";
import { ShaderProgram } from "../common/program";

export interface MaterialConfig {
  color: string | number | Color;
  [key: string]: any;
}

/**
 * 材质基类
 */
export abstract class Material {
  private _shaderProgram: ShaderProgram | undefined = undefined;
  protected _color: Color | undefined = undefined;
  protected config: MaterialConfig;
  protected shaderSource: ShaderSource | undefined = undefined;

  constructor(config: MaterialConfig) {
    this.config = config;
    this.init();
  }

  init() {
    this.initColor();
  }

  abstract initShader(): void;

  initColor() {
    if (this.config.color instanceof Color) {
      this._color = this.config.color;
    } else {
      this._color = new Color(this.config.color);
    }
  }

  get color(): Color | undefined {
    return this._color;
  }

  set color(value: Color) {
    this._color = value;
  }

  /**
   * 确保已创建并与 `gl` 关联的 ShaderProgram（不切换当前 program）
   * @param gl
   * @returns
   */
  ensureShaderProgram(gl: WebGL2RenderingContext): ShaderProgram {
    if (!this._shaderProgram) {
      if (!this.shaderSource)
        throw new Error("Material: shader source is not set");
      this._shaderProgram = ShaderProgram.create(gl, this.shaderSource);
    }
    return this._shaderProgram;
  }

  /**
   * 附加材质相关状态到 WebGL 上下文
   * @param gl
   * @param skipUseProgram 是否跳过切换当前 program
   */
  attach(gl: WebGL2RenderingContext, skipUseProgram = false): void {
    if (__LOG__) console.log(`[Material] attach`);
    const sp = this.ensureShaderProgram(gl);
    if (!skipUseProgram) sp.useProgram();
    const locColor = sp.getUniformLocation("u_material.color");
    if (locColor && this._color) {
      gl.uniform3fv(locColor, this._color.toArray());
      if (__LOG__) console.log(`[Material] gl.uniform3fv`);
    }
  }

  get sp(): ShaderProgram | undefined {
    return this._shaderProgram ?? undefined;
  }
}
