import { vec4 } from "gl-matrix";

export default class Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x = 0, y = 0, z = 0, w = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  clone() {
    return new Vec4(this.x, this.y, this.z, this.w);
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

  get ["2"]() {
    return this.z;
  }

  set ["2"](value) {
    this.z = value;
  }

  get ["3"]() {
    return this.w;
  }

  set ["3"](value) {
    this.w = value;
  }

  get r() {
    return this.x;
  }

  set r(value) {
    this.x = value;
  }

  get g() {
    return this.y;
  }

  set g(value) {
    this.y = value;
  }

  get b() {
    return this.z;
  }

  set b(value) {
    this.z = value;
  }

  get a() {
    return this.w;
  }

  set a(value) {
    this.w = value;
  }

  modulo(a) {
    const x = this.x % a.x;
    const y = this.y % a.y;
    const z = this.z % a.z;
    const w = this.w % a.w;
    return new Vec4(x, y, z, w);
  }

  abs() {
    const x = Math.abs(this.x);
    const y = Math.abs(this.y);
    const z = Math.abs(this.z);
    const w = Math.abs(this.w);
    return new Vec4(x, y, z, w);
  }

  dot(a: Vec4): number {
    return this.x * a.x + this.y * a.y + this.z * a.z + this.w * a.w;
  }
}

const vec4Methods = [
  "add",
  "subtract",
  "multiply",
  "divide",
  "ceil",
  "floor",
  "min",
  "max",
  "round",
  "scale",
  "scaleAndAdd",
  "negate",
  "inverse",
  "normalize",
  "cross",
  "lerp",
  "hermite",
  "bezier",
  "random",
  "transformMat4",
  "transformQuat",
];

const voidMethods = [
  "distance",
  "squaredDistance",
  "length",
  "squaredLength",
  "dot",
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

for (const method of vec4Methods) {
  Vec4.prototype[method] = function (...args) {
    const out = new Vec4();
    vec4[method](out, this, ...args);
    return out;
  };
}

for (const method of voidMethods) {
  Vec4.prototype[method] = function (...args) {
    return vec4[method](this, ...args);
  };
}

for (const [from, to] of Object.entries(aliases)) {
  Vec4.prototype[from] = Vec4.prototype[to];
}
