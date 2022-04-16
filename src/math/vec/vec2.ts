import { floatEq, Mat3, Vec3 } from "..";

class Vec2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  add(a: Vec2): Vec2 {
    const x = this.x + a.y;
    const y = this.y + a.y;
    return new Vec2(x, y);
  }

  subtract(a: Vec2): Vec2 {
    const x = this.x - a.y;
    const y = this.y - a.y;
    return new Vec2(x, y);
  }

  multiply(a: Vec2): Vec2 {
    const x = this.x * a.y;
    const y = this.y * a.y;
    return new Vec2(x, y);
  }

  divide(a: Vec2): Vec2 {
    const x = this.x / a.y;
    const y = this.y / a.y;
    return new Vec2(x, y);
  }

  modulo(a: Vec2): Vec2 {
    const x = this.x % a.x;
    const y = this.y % a.y;
    return new Vec2(x, y);
  }

  min(a: Vec2): Vec2 {
    const x = Math.min(this.x, a.x);
    const y = Math.min(this.y, a.y);
    return new Vec2(x, y);
  }

  max(a: Vec2): Vec2 {
    const x = Math.max(this.x, a.x);
    const y = Math.max(this.y, a.y);
    return new Vec2(x, y);
  }

  cross(a: Vec2): Vec3 {
    const z = this.x * a.y - this.y * a.x;
    return new Vec3(0, 0, z);
  }

  scale(s: number): Vec2 {
    const x = this.x * s;
    const y = this.y * s;
    return new Vec2(x, y);
  }

  lerp(a: Vec2, t: number): Vec2 {
    const x = this.x + t * (a.x - this.x);
    const y = this.y + t * (a.y - this.y);
    return new Vec2(x, y);
  }

  rotate(center: Vec2, angle: number): Vec2 {
    const x0 = this.x - center.x;
    const y0 = this.y - center.y;
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);

    const x = x0 * cosAngle - y0 * sinAngle + center.x;
    const y = x0 * sinAngle - y0 * cosAngle + center.y;
    return new Vec2(x, y);
  }

  transformMat3(a: Mat3): Vec2 {
    const x = this.x * a.m00 + this.y * a.m10 + a.m20;
    const y = this.x * a.m01 + this.y * a.m11 + a.m21;
    return new Vec2(x, y);
  }

  distance(a: Vec2): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }

  squaredDistance(a: Vec2): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    return dx ** 2 + dy ** 2;
  }

  dot(a: Vec2): number {
    return this.x * a.x + this.y * a.y;
  }

  equals(a: Vec2): boolean {
    return floatEq(this.x, a.x) && floatEq(this.y, a.y);
  }

  exactEquals(a: Vec2): boolean {
    return this.x === a.x && this.y === a.y;
  }

  abs(): Vec2 {
    const x = Math.abs(this.x);
    const y = Math.abs(this.y);
    return new Vec2(x, y);
  }

  floor(): Vec2 {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    return new Vec2(x, y);
  }

  ceil(): Vec2 {
    const x = Math.ceil(this.x);
    const y = Math.ceil(this.y);
    return new Vec2(x, y);
  }

  normalize(): Vec2 {
    const length = Math.sqrt(this.x ** 2 + this.y ** 2);
    if (length === 0) {
      return new Vec2(0, 0);
    }
    const invLength = 1 / length;
    const x = this.x * invLength;
    const y = this.y * invLength;
    return new Vec2(x, y);
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  squaredLength(): number {
    return this.x ** 2 + this.y ** 2;
  }
}

interface Vec2 {
  sub: typeof Vec2.prototype.subtract;
  mul: typeof Vec2.prototype.multiply;
  div: typeof Vec2.prototype.divide;
  mod: typeof Vec2.prototype.modulo;
  len: typeof Vec2.prototype.length;
  sqrLen: typeof Vec2.prototype.squaredLength;
  dist: typeof Vec2.prototype.distance;
  sqrDist: typeof Vec2.prototype.squaredDistance;
}

Vec2.prototype.sub = Vec2.prototype.subtract;
Vec2.prototype.mul = Vec2.prototype.multiply;
Vec2.prototype.div = Vec2.prototype.divide;
Vec2.prototype.mod = Vec2.prototype.modulo;
Vec2.prototype.len = Vec2.prototype.length;
Vec2.prototype.sqrLen = Vec2.prototype.squaredLength;
Vec2.prototype.dist = Vec2.prototype.distance;
Vec2.prototype.sqrDist = Vec2.prototype.squaredDistance;

export { Vec2 };

export function vec2(x = 0, y = 0) {
  return new Vec2(x, y);
}
