export class ShaderProgram {
  private static readonly instances = new WeakMap<
    WebGLRenderingContext,
    Map<number, ShaderProgram>
  >();

  private static readonly currentProgramByGl = new WeakMap<
    WebGLRenderingContext,
    WebGLProgram | null
  >();

  readonly gl: WebGLRenderingContext;
  private readonly glProgram: WebGLProgram;
  unique: number = -1;

  useProgram(): void {
    const last = ShaderProgram.currentProgramByGl.get(this.gl);
    // 微小优化 如果上一次的program和当前的program一致，在驱动层面仍然会return
    // 但是直接在js代码层面直接return 性能更好
    if (last === this.glProgram) return;
    this.gl.useProgram(this.glProgram);
    ShaderProgram.currentProgramByGl.set(this.gl, this.glProgram);
    if (__DEBUG__) {
      console.log(`gl.useProgram, unique: ${this.unique}`);
    }
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.gl.getUniformLocation(this.glProgram, name);
  }

  getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.glProgram, name);
  }

  static create(
    gl: WebGLRenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
  ): ShaderProgram {
    const key = ShaderProgram.sourceKey(vertexShaderSource, fragmentShaderSource);
    let perGl = ShaderProgram.instances.get(gl);
    if (!perGl) {
      perGl = new Map();
      ShaderProgram.instances.set(gl, perGl);
    }
    const hit = perGl.get(key);
    if (hit) {
      return hit;
    }
    const sp = new ShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    perGl.set(key, sp);
    sp.unique = key;
    return sp;
  }

  private constructor(
    gl: WebGLRenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
  ) {
    this.gl = gl;
    const program = this.buildProgram(vertexShaderSource, fragmentShaderSource);
    if (!program) {
      throw new Error("Failed to create shader program");
    }
    this.glProgram = program;
  }

  private static sourceKey(vertex: string, fragment: string): number {
    let h = 2166136261;
    const p = 16777619;
    for (let i = 0; i < vertex.length; i++) {
      h ^= vertex.charCodeAt(i);
      h = Math.imul(h, p);
    }
    h ^= 0xff;
    h = Math.imul(h, p);
    for (let i = 0; i < fragment.length; i++) {
      h ^= fragment.charCodeAt(i);
      h = Math.imul(h, p);
    }
    h ^= vertex.length;
    h = Math.imul(h, p);
    h ^= fragment.length;
    return Math.imul(h, p) >>> 0;
  }

  private buildProgram(
    vertexShaderSource: string,
    fragmentShaderSource: string,
  ): WebGLProgram | null {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      return null;
    }

    this.setShaderSource(vertexShader, vertexShaderSource);
    this.setShaderSource(fragmentShader, fragmentShaderSource);

    if (!this.compileShader(vertexShader, "vertex")) {
      return null;
    }
    if (!this.compileShader(fragmentShader, "fragment")) {
      return null;
    }

    const program = this.createProgram();
    if (!program) {
      return null;
    }

    this.attachShaders(program, vertexShader, fragmentShader);
    if (!this.verifyLink(program)) {
      return null;
    }

    return program;
  }

  private createShader(type: number): WebGLShader | null {
    return this.gl.createShader(type);
  }

  private setShaderSource(shader: WebGLShader, source: string): void {
    this.gl.shaderSource(shader, source);
  }

  private compileShader(shader: WebGLShader, kind: "vertex" | "fragment"): boolean {
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(`ERROR compiling ${kind} shader!`, this.gl.getShaderInfoLog(shader));
      return false;
    }
    return true;
  }

  private createProgram(): WebGLProgram | null {
    return this.gl.createProgram();
  }

  private attachShaders(
    program: WebGLProgram,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
  ): void {
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
  }

  private verifyLink(program: WebGLProgram): boolean {
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error("ERROR linking program!", this.gl.getProgramInfoLog(program));
      return false;
    }
    return true;
  }
}
