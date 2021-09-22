import { vec2 } from "gl-matrix";

import Vec3 from "./vec3";

export default class Vec2 {
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

  get ["1"]() {
    return this.y;
  }

  set ["0"](value) {
    this.x = value;
  }

  set ["1"](value) {
    this.y = value;
  }

  modulo(a) {
    const x = this.x % a.x;
    const y = this.y % a.y;
    return new Vec2(x, y);
  }

  abs() {
    const x = Math.abs(this.x);
    const y = Math.abs(this.y);
    return new Vec2(x, y);
  }
}

const vec2Methods = [
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
