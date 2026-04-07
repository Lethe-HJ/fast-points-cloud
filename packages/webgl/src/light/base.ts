export class Light {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  clearUniformNeedUpdate(): void {}
}
