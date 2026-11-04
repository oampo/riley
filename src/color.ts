import type { Vec4 } from "./math";
import { vec4 } from "./math";

export type RgbaColor = {
  vec: Vec4;
  r: number;
  g: number;
  b: number;
  a: number;
  withR(r: number): RgbaColor;
  withG(g: number): RgbaColor;
  withB(b: number): RgbaColor;
  withA(a: number): RgbaColor;
  eq(a: RgbaColor): boolean;
};

class RgbaColorImpl implements RgbaColor {
  readonly vec: Vec4;
  constructor(r: number, g: number, b: number, a: number) {
    this.vec = vec4(r, g, b, a);
  }

  get r(): number {
    return this.vec.x;
  }

  get g(): number {
    return this.vec.y;
  }

  get b(): number {
    return this.vec.z;
  }

  get a(): number {
    return this.vec.w;
  }

  withR(r: number): RgbaColor {
    return rgba(r, this.g, this.b, this.a);
  }

  withG(g: number): RgbaColor {
    return rgba(this.r, g, this.b, this.a);
  }

  withB(b: number): RgbaColor {
    return rgba(this.r, this.g, b, this.a);
  }

  withA(a: number): RgbaColor {
    return rgba(this.r, this.g, this.b, a);
  }

  eq(a: RgbaColor): boolean {
    return this.vec.eq(a.vec);
  }
}

export function rgb(r: number, g: number, b: number): RgbaColor {
  return new RgbaColorImpl(r, g, b, 1);
}

export function rgba(r: number, g: number, b: number, a: number): RgbaColor {
  return new RgbaColorImpl(r, g, b, a);
}

export function rgbaHex(x: RgbaColor): string {
  return (
    Math.floor(x.r * 255)
      .toString(16)
      .padStart(2, "0") +
    Math.floor(x.g * 255)
      .toString(16)
      .padStart(2, "0") +
    Math.floor(x.b * 255)
      .toString(16)
      .padStart(2, "0") +
    Math.floor(x.a * 255)
      .toString(16)
      .padStart(2, "0")
  );
}

export function rgbHex(x: RgbaColor): string {
  return (
    Math.floor(x.r * 255)
      .toString(16)
      .padStart(2, "0") +
    Math.floor(x.g * 255)
      .toString(16)
      .padStart(2, "0") +
    Math.floor(x.b * 255)
      .toString(16)
      .padStart(2, "0")
  );
}
