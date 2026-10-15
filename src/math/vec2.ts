import { floatEq } from ".";
import type { Vec3 } from "./vec3";
import { vec3 } from "./vec3";

export interface Vec2 {
  readonly dimensions: 2;
  readonly x: number;
  readonly y: number;

  withX(x: number): Vec2;
  withY(y: number): Vec2;
  add(a: Vec2): Vec2;
  sub(a: Vec2): Vec2;
  mul(a: Vec2): Vec2;
  div(a: Vec2): Vec2;
  mod(a: Vec2): Vec2;
  min(a: Vec2): Vec2;
  max(a: Vec2): Vec2;
  cross(a: Vec2): Vec3;
  scale(s: number): Vec2;
  lerp(a: Vec2, t: number): Vec2;
  rotate(center: Vec2, angle: number): Vec2;
  dist(a: Vec2): number;
  sqrDist(a: Vec2): number;
  dot(a: Vec2): number;
  eq(a: Vec2): boolean;
  exactEq(a: Vec2): boolean;
  abs(): Vec2;
  floor(): Vec2;
  ceil(): Vec2;
  normalize(): Vec2;
  len(): number;
  sqrLen(): number;
}

export class Vec2Impl implements Vec2 {
  readonly dimensions = 2;

  constructor(
    readonly x = 0,
    readonly y = 0,
  ) {}

  withX(x: number): Vec2 {
    return vec2(x, this.y);
  }

  withY(y: number): Vec2 {
    return vec2(this.x, y);
  }

  add(a: Vec2): Vec2 {
    const x = this.x + a.y;
    const y = this.y + a.y;
    return vec2(x, y);
  }

  sub(a: Vec2): Vec2 {
    const x = this.x - a.y;
    const y = this.y - a.y;
    return vec2(x, y);
  }

  mul(a: Vec2): Vec2 {
    const x = this.x * a.y;
    const y = this.y * a.y;
    return vec2(x, y);
  }

  div(a: Vec2): Vec2 {
    const x = this.x / a.y;
    const y = this.y / a.y;
    return vec2(x, y);
  }

  mod(a: Vec2): Vec2 {
    const x = this.x % a.x;
    const y = this.y % a.y;
    return vec2(x, y);
  }

  min(a: Vec2): Vec2 {
    const x = Math.min(this.x, a.x);
    const y = Math.min(this.y, a.y);
    return vec2(x, y);
  }

  max(a: Vec2): Vec2 {
    const x = Math.max(this.x, a.x);
    const y = Math.max(this.y, a.y);
    return vec2(x, y);
  }

  cross(a: Vec2): Vec3 {
    const z = this.x * a.y - this.y * a.x;
    return vec3(0, 0, z);
  }

  scale(s: number): Vec2 {
    const x = this.x * s;
    const y = this.y * s;
    return vec2(x, y);
  }

  lerp(a: Vec2, t: number): Vec2 {
    const x = this.x + t * (a.x - this.x);
    const y = this.y + t * (a.y - this.y);
    return vec2(x, y);
  }

  rotate(center: Vec2, angle: number): Vec2 {
    const x0 = this.x - center.x;
    const y0 = this.y - center.y;
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);

    const x = x0 * cosAngle - y0 * sinAngle + center.x;
    const y = x0 * sinAngle - y0 * cosAngle + center.y;
    return vec2(x, y);
  }

  dist(a: Vec2): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }

  sqrDist(a: Vec2): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    return dx ** 2 + dy ** 2;
  }

  dot(a: Vec2): number {
    return this.x * a.x + this.y * a.y;
  }

  eq(a: Vec2): boolean {
    return floatEq(this.x, a.x) && floatEq(this.y, a.y);
  }

  exactEq(a: Vec2): boolean {
    return this.x === a.x && this.y === a.y;
  }

  abs(): Vec2 {
    const x = Math.abs(this.x);
    const y = Math.abs(this.y);
    return vec2(x, y);
  }

  floor(): Vec2 {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    return vec2(x, y);
  }

  ceil(): Vec2 {
    const x = Math.ceil(this.x);
    const y = Math.ceil(this.y);
    return vec2(x, y);
  }

  normalize(): Vec2 {
    const length = Math.sqrt(this.x ** 2 + this.y ** 2);
    if (length === 0) {
      return vec2(0, 0);
    }
    const invLength = 1 / length;
    const x = this.x * invLength;
    const y = this.y * invLength;
    return vec2(x, y);
  }

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  sqrLen(): number {
    return this.x ** 2 + this.y ** 2;
  }
}

export function vec2(x = 0, y = 0): Vec2 {
  return new Vec2Impl(x, y);
}
