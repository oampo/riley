import { vec4 } from "gl-matrix";

export default class Vec4 {
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

  get ["1"]() {
    return this.y;
  }

  get ["2"]() {
    return this.z;
  }

  get ["3"]() {
    return this.w;
  }

  set ["0"](value) {
    this.x = value;
  }

  set ["1"](value) {
    this.y = value;
  }

  set ["2"](value) {
    this.z = value;
  }

  set ["3"](value) {
    this.w = value;
  }

  get r() {
    return this.x;
  }

  get g() {
    return this.y;
  }

  get b() {
    return this.z;
  }

  get a() {
    return this.w;
  }

  set r(value) {
    this.x = value;
  }

  set g(value) {
    this.y = value;
  }

  set b(value) {
    this.z = value;
  }

  set a(value) {
    this.w = value;
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
