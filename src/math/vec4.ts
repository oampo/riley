import { floatEq } from ".";

export interface Vec4 {
  readonly dimensions: 4;
  x: number;
  y: number;
  z: number;
  w: number;

  withX(x: number): Vec4;
  withY(y: number): Vec4;
  withZ(z: number): Vec4;
  withW(w: number): Vec4;
  add(a: Vec4): Vec4;
  sub(a: Vec4): Vec4;
  mul(a: Vec4): Vec4;
  div(a: Vec4): Vec4;
  mod(a: Vec4): Vec4;
  min(a: Vec4): Vec4;
  max(a: Vec4): Vec4;
  scale(s: number): Vec4;
  lerp(a: Vec4, t: number): Vec4;
  distance(a: Vec4): number;
  sqrDist(a: Vec4): number;
  dot(a: Vec4): number;
  eq(a: Vec4): boolean;
  exactEq(a: Vec4): boolean;
  abs(): Vec4;
  floor(): Vec4;
  ceil(): Vec4;
  normalize(): Vec4;
  length(): number;
  sqrLen(): number;
}

export class Vec4Impl implements Vec4 {
  readonly dimensions = 4;

  constructor(
    readonly x = 0,
    readonly y = 0,
    readonly z = 0,
    readonly w = 0,
  ) {}

  withX(x: number): Vec4 {
    return vec4(x, this.y, this.z, this.w);
  }

  withY(y: number): Vec4 {
    return vec4(this.x, y, this.z, this.w);
  }

  withZ(z: number): Vec4 {
    return vec4(this.x, this.y, z, this.w);
  }

  withW(w: number): Vec4 {
    return vec4(this.x, this.y, this.z, w);
  }

  add(a: Vec4): Vec4 {
    const x = this.x + a.x;
    const y = this.y + a.y;
    const z = this.z + a.z;
    const w = this.w + a.w;
    return vec4(x, y, z, w);
  }

  sub(a: Vec4): Vec4 {
    const x = this.x - a.x;
    const y = this.y - a.y;
    const z = this.z - a.z;
    const w = this.w - a.w;
    return vec4(x, y, z, w);
  }

  mul(a: Vec4): Vec4 {
    const x = this.x * a.x;
    const y = this.y * a.y;
    const z = this.z * a.z;
    const w = this.w * a.w;
    return vec4(x, y, z, w);
  }

  div(a: Vec4): Vec4 {
    const x = this.x / a.x;
    const y = this.y / a.y;
    const z = this.z / a.z;
    const w = this.w / a.w;
    return vec4(x, y, z, w);
  }

  mod(a: Vec4): Vec4 {
    const x = this.x % a.x;
    const y = this.y % a.y;
    const z = this.z % a.z;
    const w = this.w % a.w;
    return vec4(x, y, z, w);
  }

  min(a: Vec4): Vec4 {
    const x = Math.min(this.x, a.x);
    const y = Math.min(this.y, a.y);
    const z = Math.min(this.z, a.z);
    const w = Math.min(this.w, a.w);
    return vec4(x, y, z, w);
  }

  max(a: Vec4): Vec4 {
    const x = Math.max(this.x, a.x);
    const y = Math.max(this.y, a.y);
    const z = Math.max(this.z, a.z);
    const w = Math.max(this.w, a.w);
    return vec4(x, y, z, w);
  }

  scale(s: number): Vec4 {
    const x = this.x * s;
    const y = this.y * s;
    const z = this.z * s;
    const w = this.w * s;
    return vec4(x, y, z, w);
  }

  lerp(a: Vec4, t: number): Vec4 {
    const x = this.x + t * (a.x - this.x);
    const y = this.y + t * (a.y - this.y);
    const z = this.z + t * (a.z - this.z);
    const w = this.w + t * (a.w - this.w);
    return vec4(x, y, z, w);
  }

  distance(a: Vec4): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    const dz = this.z - a.z;
    const dw = this.w - a.w;
    return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2 + dw ** 2);
  }

  sqrDist(a: Vec4): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    const dz = this.z - a.z;
    const dw = this.w - a.w;
    return dx ** 2 + dy ** 2 + dz ** 2 + dw ** 2;
  }

  dot(a: Vec4): number {
    return this.x * a.x + this.y * a.y + this.z * a.z + this.w * a.w;
  }

  eq(a: Vec4): boolean {
    return (
      floatEq(this.x, a.x) &&
      floatEq(this.y, a.y) &&
      floatEq(this.z, a.z) &&
      floatEq(this.w, a.w)
    );
  }

  exactEq(a: Vec4): boolean {
    return this.x === a.x && this.y === a.y && this.z === a.z && this.w === a.w;
  }

  abs(): Vec4 {
    const x = Math.abs(this.x);
    const y = Math.abs(this.y);
    const z = Math.abs(this.z);
    const w = Math.abs(this.w);
    return vec4(x, y, z, w);
  }

  floor(): Vec4 {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const z = Math.floor(this.z);
    const w = Math.floor(this.w);
    return vec4(x, y, z, w);
  }

  ceil(): Vec4 {
    const x = Math.ceil(this.x);
    const y = Math.ceil(this.y);
    const z = Math.ceil(this.z);
    const w = Math.ceil(this.w);
    return vec4(x, y, z, w);
  }

  normalize(): Vec4 {
    const length = Math.sqrt(
      this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2,
    );
    if (length === 0) {
      return vec4(0, 0, 0, 0);
    }
    const invLength = 1 / length;
    const x = this.x * invLength;
    const y = this.y * invLength;
    const z = this.y * invLength;
    const w = this.w * invLength;
    return vec4(x, y, z, w);
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2);
  }

  sqrLen(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2;
  }
}

export function vec4(x = 0, y = 0, z = 0, w = 0): Vec4 {
  return new Vec4Impl(x, y, z, w);
}
