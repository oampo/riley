import type { Line } from "./line";
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

export function color(line: Line): RgbaColor;
export function color(line: Line, color: RgbaColor): Line;
export function color(line: Line, color?: RgbaColor): RgbaColor | Line {
  if (!color) {
    return line.color;
  }

  return {
    ...line,
    color,
  };
}

export function red(line: Line): number;
export function red(line: Line, value: number): Line;
export function red(line: Line, value?: number): number | Line {
  if (value == null) {
    return line.color.r;
  }

  return {
    ...line,
    color: line.color.withR(value),
  };
}

export function green(line: Line): number;
export function green(line: Line, value: number): Line;
export function green(line: Line, value?: number): number | Line {
  if (value == null) {
    return line.color.g;
  }

  return {
    ...line,
    color: line.color.withG(value),
  };
}

export function blue(line: Line): number;
export function blue(line: Line, value: number): Line;
export function blue(line: Line, value?: number): number | Line {
  if (value == null) {
    return line.color.b;
  }

  return {
    ...line,
    color: line.color.withB(value),
  };
}

export function alpha(line: Line): number;
export function alpha(line: Line, value: number): Line;
export function alpha(line: Line, value?: number): number | Line {
  if (value == null) {
    return line.color.a;
  }

  return {
    ...line,
    color: line.color.withA(value),
  };
}
