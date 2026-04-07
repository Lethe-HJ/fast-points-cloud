import { ShaderProgram } from "../common/program";
import { Color } from "../common/color/color";
import { Light } from "./base";

type AmbientLightNeedUpdate = {
  color: boolean;
  intensity: boolean;
};

export class AmbientLight extends Light {
  private _color: Color;

  private _intensity: number;

  private readonly needUpdateMap = new Map<
    ShaderProgram,
    AmbientLightNeedUpdate
  >();

  private _orphanColorDirty = true;
  private _orphanIntensityDirty = true;

  private _offProgramActivated: (() => void) | undefined;

  constructor(color: string | number, intensity: number = 1) {
    super("AmbientLight");
    this._color = new Color(color);
    this._intensity = intensity;
  }

  get color(): Color {
    return this._color;
  }

  set color(value: Color) {
    this._color = value;
    this.markColorDirty();
  }

  get intensity(): number {
    return this._intensity;
  }

  set intensity(value: number) {
    this._intensity = value;
    this.markIntensityDirty();
  }

  setColor(color: string | number): this {
    this._color = new Color(color);
    this.markColorDirty();
    return this;
  }

  setIntensity(intensity: number): this {
    this._intensity = intensity;
    this.markIntensityDirty();
    return this;
  }

  private markColorDirty(): void {
    this._orphanColorDirty = true;
    for (const nu of this.needUpdateMap.values()) {
      nu.color = true;
    }
  }

  private markIntensityDirty(): void {
    this._orphanIntensityDirty = true;
    for (const nu of this.needUpdateMap.values()) {
      nu.intensity = true;
    }
  }

  private getNeedUpdateFor(sp: ShaderProgram): AmbientLightNeedUpdate {
    let nu = this.needUpdateMap.get(sp);
    if (!nu) {
      nu = {
        color: this._orphanColorDirty,
        intensity: this._orphanIntensityDirty,
      };
      this.needUpdateMap.set(sp, nu);
      this._orphanColorDirty = false;
      this._orphanIntensityDirty = false;
    }
    return nu;
  }

  private ensureProgramActivatedSubscription(gl: WebGL2RenderingContext): void {
    if (this._offProgramActivated) return;
    this._offProgramActivated = ShaderProgram.onProgramActivated(
      gl,
      (sp: ShaderProgram) => {
        let nu = this.needUpdateMap.get(sp);
        if (!nu) {
          nu = {
            color: true,
            intensity: true,
          };
          this.needUpdateMap.set(sp, nu);
        }
      },
    );
  }

  attach(
    gl: WebGL2RenderingContext,
    sp: ShaderProgram,
    skipUseProgram = false,
  ): void {
    this.ensureProgramActivatedSubscription(gl);
    if (!skipUseProgram) sp.useProgram();
    const needUpdate = this.getNeedUpdateFor(sp);
    if (!needUpdate.color && !needUpdate.intensity) return;
    const loc = sp.getUniformLocation("u_ambientLightColor");
    if (loc) {
      const colorArray = this._color.toArray();
      const scaledColor = [
        colorArray[0] * this._intensity,
        colorArray[1] * this._intensity,
        colorArray[2] * this._intensity,
      ] as [number, number, number];
      gl.uniform3fv(loc, scaledColor);
      needUpdate.color = false;
      needUpdate.intensity = false;
      if (__LOG__)
        console.log(`[AmbientLight] gl.uniform3fv u_ambientLightColor`);
    }
  }

  override clearUniformNeedUpdate(): void {
    for (const nu of this.needUpdateMap.values()) {
      nu.color = false;
      nu.intensity = false;
    }
  }
}
