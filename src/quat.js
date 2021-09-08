import { quat } from "gl-matrix";
import Vec3 from "./vec3";

export default class Quat {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  clone() {
    return new Quat(this.x, this.y, this.z, this.w);
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
}

const quatMethods = [
  "setAxisAngle",
  "multiply",
  "rotateX",
  "rotateY",
  "rotateZ",
  "calculateW",
  "exp",
  "ln",
  "pow",
  "slerp",
  "random",
  "invert",
  "conjugate",
  "fromMat3",
  "fromEuler",
  "add",
  "scale",
  "lerp",
  "normalize",
  "rotationTo",
  "sqlerp",
  "setAxes",
];

const vec3Methods = ["getAxisAngle"];

const voidMethods = [
  "getAngle",
  "str",
  "dot",
  "length",
  "squaredLength",
  "exactEquals",
  "equals",
];

const aliases = {
  mul: "multiply",
  len: "length",
  sqrLen: "squaredLength",
};

for (const method of quatMethods) {
  Quat.prototype[method] = function (...args) {
    const out = new Quat();
    quat[method](out, this, ...args);
    return out;
  };
}

for (const method of vec3Methods) {
  Quat.prototype[method] = function (...args) {
    const out = new Vec3();
    quat[method](out, this, ...args);
    return out;
  };
}

for (const method of voidMethods) {
  Quat.prototype[method] = function (...args) {
    return quat[method](this, ...args);
  };
}

for (const [from, to] of Object.entries(aliases)) {
  Quat.prototype[from] = Quat.prototype[to];
}
