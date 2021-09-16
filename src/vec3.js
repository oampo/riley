import { vec3 } from "gl-matrix";

export default class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone() {
    return new Vec3(this.x, this.y, this.z);
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

  set ["0"](value) {
    this.x = value;
  }

  set ["1"](value) {
    this.y = value;
  }

  set ["2"](value) {
    this.z = value;
  }

  modulo(a) {
    const x = this.x % a.x;
    const y = this.y % a.y;
    const z = this.z % a.z;
    return new Vec3(x, y, z);
  }
}

const vec3Methods = [
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
  "transformMat3",
  "transformMat4",
  "transformQuat",
  "rotateX",
  "rotateY",
  "rotateZ",
];

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

for (const method of vec3Methods) {
  Vec3.prototype[method] = function (...args) {
    const out = new Vec3();
    vec3[method](out, this, ...args);
    return out;
  };
}

for (const method of voidMethods) {
  Vec3.prototype[method] = function (...args) {
    return vec3[method](this, ...args);
  };
}

for (const [from, to] of Object.entries(aliases)) {
  Vec3.prototype[from] = Vec3.prototype[to];
}
