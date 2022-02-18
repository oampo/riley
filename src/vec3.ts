import { floatEq } from "./math";

class Vec3 {
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone() {
    return new Vec3(this.x, this.y, this.z);
  }

  add(a: Vec3): Vec3 {
    const x = this.x + a.x;
    const y = this.y + a.y;
    const z = this.z + a.z;
    return new Vec3(x, y, z);
  }

  subtract(a: Vec3): Vec3 {
    const x = this.x - a.x;
    const y = this.y - a.y;
    const z = this.z - a.z;
    return new Vec3(x, y, z);
  }

  multiply(a: Vec3): Vec3 {
    const x = this.x * a.x;
    const y = this.y * a.y;
    const z = this.z * a.z;
    return new Vec3(x, y, z);
  }

  divide(a: Vec3): Vec3 {
    const x = this.x / a.x;
    const y = this.y / a.y;
    const z = this.z / a.z;
    return new Vec3(x, y, z);
  }

  modulo(a: Vec3): Vec3 {
    const x = this.x % a.x;
    const y = this.y % a.y;
    const z = this.z % a.z;
    return new Vec3(x, y, z);
  }

  min(a: Vec3): Vec3 {
    const x = Math.min(this.x, a.x);
    const y = Math.min(this.y, a.y);
    const z = Math.min(this.z, a.z);
    return new Vec3(x, y, z);
  }

  max(a: Vec3): Vec3 {
    const x = Math.max(this.x, a.x);
    const y = Math.max(this.y, a.y);
    const z = Math.max(this.z, a.z);
    return new Vec3(x, y, z);
  }

  cross(a: Vec3): Vec3 {
    const x = this.y * a.z - this.z * a.y;
    const y = this.z * a.x - this.x * a.z;
    const z = this.x * a.y - this.y * a.x;
    return new Vec3(x, y, z);
  }

  scale(s: number): Vec3 {
    const x = this.x * s;
    const y = this.y * s;
    const z = this.z * s;
    return new Vec3(x, y, z);
  }

  lerp(a: Vec3, t: number): Vec3 {
    const x = this.x + t * (a.x - this.x);
    const y = this.y + t * (a.y - this.y);
    const z = this.z + t * (a.z - this.z);
    return new Vec3(x, y, z);
  }

  distance(a: Vec3): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    const dz = this.z - a.z;
    return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
  }

  squaredDistance(a: Vec3): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    const dz = this.z - a.z;
    return dx ** 2 + dy ** 2 + dz ** 2;
  }

  dot(a: Vec3): number {
    return this.x * a.x + this.y * a.y + this.z * a.z;
  }

  equals(a: Vec3): boolean {
    return floatEq(this.x, a.x) && floatEq(this.y, a.y) && floatEq(this.z, a.z);
  }

  exactEquals(a: Vec3): boolean {
    return this.x === a.x && this.y === a.y && this.z === a.z;
  }

  abs(): Vec3 {
    const x = Math.abs(this.x);
    const y = Math.abs(this.y);
    const z = Math.abs(this.z);
    return new Vec3(x, y, z);
  }

  floor(): Vec3 {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    const z = Math.floor(this.z);
    return new Vec3(x, y, z);
  }

  ceil(): Vec3 {
    const x = Math.ceil(this.x);
    const y = Math.ceil(this.y);
    const z = Math.ceil(this.z);
    return new Vec3(x, y, z);
  }

  normalize(): Vec3 {
    const length = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    if (length === 0) {
      return new Vec3(0, 0, 0);
    }
    const invLength = 1 / length;
    const x = this.x * invLength;
    const y = this.y * invLength;
    const z = this.y * invLength;
    return new Vec3(x, y, z);
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  squaredLength(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }
}

interface Vec3 {
  sub: typeof Vec3.prototype.subtract;
  mul: typeof Vec3.prototype.multiply;
  div: typeof Vec3.prototype.divide;
  mod: typeof Vec3.prototype.modulo;
  len: typeof Vec3.prototype.length;
  sqrLen: typeof Vec3.prototype.squaredLength;
  dist: typeof Vec3.prototype.distance;
  sqrDist: typeof Vec3.prototype.squaredDistance;
}

Vec3.prototype.sub = Vec3.prototype.subtract;
Vec3.prototype.mul = Vec3.prototype.multiply;
Vec3.prototype.div = Vec3.prototype.divide;
Vec3.prototype.mod = Vec3.prototype.modulo;
Vec3.prototype.len = Vec3.prototype.length;
Vec3.prototype.sqrLen = Vec3.prototype.squaredLength;
Vec3.prototype.dist = Vec3.prototype.distance;
Vec3.prototype.sqrDist = Vec3.prototype.squaredDistance;

export default Vec3;
