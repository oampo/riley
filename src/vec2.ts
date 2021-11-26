import { vec2 } from "gl-matrix";

import Vec3 from "./vec3";

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

  get ["0"]() {
    return this.x;
  }

  set ["0"](value) {
    this.x = value;
  }

  get ["1"]() {
    return this.y;
  }

  set ["1"](value) {
    this.y = value;
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

  lerp(a: Vec2, t: number): Vec2 {
    const x = this.x + t * (a.x - this.x);
    const y = this.y + t * (a.y - this.y);
    return new Vec2(x, y);
  }

  dot(a: Vec2): number {
    return this.x * a.x + this.y * a.y;
  }

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  abs(): Vec2 {
    const x = Math.abs(this.x);
    const y = Math.abs(this.y);
    return new Vec2(x, y);
  }
}

const vec2Methods = [
  "ceil",
  "floor",
  "round",
  "scale",
  "scaleAndAdd",
  "negate",
  "inverse",
  "normalize",
  "lerp",
  "random",
  "transformMat2",
  "transformMat2d",
  "transformMat3",
  "transformMat4",
  "rotate",
];

const vec3Methods = ["cross"];

const voidMethods = [
  "distance",
  "squaredDistance",
  "length",
  "squaredLength",
  "dot",
  "angle",
  "str",
  "exactEquals",
  "equals",
];

const aliases = {
  sub: "subtract",
  mul: "multiply",
  div: "divide",
  mod: "modulo",
  dist: "distance",
  sqrDist: "squaredDistance",
  len: "length",
  sqrLen: "squaredLength",
};

interface Vec2 {
  sub: typeof Vec2.prototype.subtract;
  mul: typeof Vec2.prototype.multiply;
  div: typeof Vec2.prototype.divide;
  mod: typeof Vec2.prototype.modulo;
}

for (const method of vec2Methods) {
  Vec2.prototype[method] = function (...args) {
    const out = new Vec2();
    vec2[method](out, this, ...args);
    return out;
  };
}

for (const method of vec3Methods) {
  Vec2.prototype[method] = function (...args) {
    const out = new Vec3();
    vec2[method](out, this, ...args);
    return out;
  };
}

for (const method of voidMethods) {
  Vec2.prototype[method] = function (...args) {
    return vec2[method](this, ...args);
  };
}

for (const [from, to] of Object.entries(aliases)) {
  Vec2.prototype[from] = Vec2.prototype[to];
}

export default Vec2;
