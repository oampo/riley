import { floatEq } from ".";

export interface Vec3 {
  readonly dimensions: 3;
  readonly x: number;
  readonly y: number;
  readonly z: number;

  withX(x: number): Vec3;
  withY(y: number): Vec3;
  withZ(z: number): Vec3;
  add(a: Vec3): Vec3;
  sub(a: Vec3): Vec3;
  mul(a: Vec3): Vec3;
  div(a: Vec3): Vec3;
  mod(a: Vec3): Vec3;
  min(a: Vec3): Vec3;
  max(a: Vec3): Vec3;
  cross(a: Vec3): Vec3;
  scale(s: number): Vec3;
  lerp(a: Vec3, t: number): Vec3;
  dist(a: Vec3): number;
  sqrDist(a: Vec3): number;
  dot(a: Vec3): number;
  eq(a: Vec3): boolean;
  exactEq(a: Vec3): boolean;
  abs(): Vec3;
  floor(): Vec3;
  ceil(): Vec3;
  normalize(): Vec3;
  len(): number;
  sqrLen(): number;
}

export class Vec3Impl implements Vec3 {
  readonly dimensions = 3;

  constructor(
    readonly x = 0,
    readonly y = 0,
    readonly z = 0,
  ) {}

  withX(x: number): Vec3 {
    return vec3(x, this.y, this.z);
  }

  withY(y: number): Vec3 {
    return vec3(this.x, y, this.z);
  }

  withZ(z: number): Vec3 {
    return vec3(this.x, this.y, z);
  }

  add(a: Vec3): Vec3 {
    const x = this.x + a.x;
    const y = this.y + a.y;
    const z = this.z + a.z;
    return vec3(x, y, z);
  }

  sub(a: Vec3): Vec3 {
    const x = this.x - a.x;
    const y = this.y - a.y;
    const z = this.z - a.z;
    return vec3(x, y, z);
  }

  mul(a: Vec3): Vec3 {
    const x = this.x * a.x;
    const y = this.y * a.y;
    const z = this.z * a.z;
    return vec3(x, y, z);
  }

  div(a: Vec3): Vec3 {
    const x = this.x / a.x;
    const y = this.y / a.y;
    const z = this.z / a.z;
    return vec3(x, y, z);
  }

  mod(a: Vec3): Vec3 {
    const x = this.x % a.x;
    const y = this.y % a.y;
    const z = this.z % a.z;
    return vec3(x, y, z);
  }

  min(a: Vec3): Vec3 {
    const x = Math.min(this.x, a.x);
    const y = Math.min(this.y, a.y);
    const z = Math.min(this.z, a.z);
    return vec3(x, y, z);
  }

  max(a: Vec3): Vec3 {
    const x = Math.max(this.x, a.x);
    const y = Math.max(this.y, a.y);
    const z = Math.max(this.z, a.z);
    return vec3(x, y, z);
  }

  cross(a: Vec3): Vec3 {
    const x = this.y * a.z - this.z * a.y;
    const y = this.z * a.x - this.x * a.z;
    const z = this.x * a.y - this.y * a.x;
    return vec3(x, y, z);
  }

  scale(s: number): Vec3 {
    const x = this.x * s;
    const y = this.y * s;
    const z = this.z * s;
    return vec3(x, y, z);
  }

  lerp(a: Vec3, t: number): Vec3 {
    const x = this.x + t * (a.x - this.x);
    const y = this.y + t * (a.y - this.y);
    const z = this.z + t * (a.z - this.z);
    return vec3(x, y, z);
  }

  dist(a: Vec3): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    const dz = this.z - a.z;
    return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
  }

  sqrDist(a: Vec3): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    const dz = this.z - a.z;
    return dx ** 2 + dy ** 2 + dz ** 2;
  }

  dot(a: Vec3): number {
    return this.x * a.x + this.y * a.y + this.z * a.z;
  }

  eq(a: Vec3): boolean {
    return floatEq(this.x, a.x) && floatEq(this.y, a.y) && floatEq(this.z, a.z);
  }

  exactEq(a: Vec3): boolean {
    return this.x === a.x && this.y === a.y && this.z === a.z;
  }

  abs(): Vec3 {
    const x = Math.abs(this.x);
    const y = Math.abs(this.y);
    const z = Math.abs(this.z);
    return vec3(x, y, z);
  }

  floor(): Vec3 {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const z = Math.floor(this.z);
    return vec3(x, y, z);
  }

  ceil(): Vec3 {
    const x = Math.ceil(this.x);
    const y = Math.ceil(this.y);
    const z = Math.ceil(this.z);
    return vec3(x, y, z);
  }

  normalize(): Vec3 {
    const length = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    if (length === 0) {
      return vec3(0, 0, 0);
    }
    const invLength = 1 / length;
    const x = this.x * invLength;
    const y = this.y * invLength;
    const z = this.z * invLength;
    return vec3(x, y, z);
  }

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  sqrLen(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }
}

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return new Vec3Impl(x, y, z);
}
