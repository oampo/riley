import { quat2 } from "gl-matrix";

import Quat from "./quat";
import Vec3 from "./vec3";

export default class Quat2 {
  rx: number;
  ry: number;
  rz: number;
  rw: number;
  dx: number;
  dy: number;
  dz: number;
  dw: number;

  constructor(rx = 0, ry = 0, rz = 0, rw = 1, dx = 0, dy = 0, dz = 0, dw = 0) {
    this.rx = rx;
    this.ry = ry;
    this.rz = rz;
    this.rw = rw;
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.dw = dw;
  }

  clone() {
    return new Quat2(
      this.rx,
      this.ry,
      this.rz,
      this.rw,
      this.dx,
      this.dy,
      this.dz,
      this.dw
    );
  }

  get ["0"]() {
    return this.rx;
  }

  set ["0"](value) {
    this.rx = value;
  }

  get ["1"]() {
    return this.ry;
  }

  set ["1"](value) {
    this.ry = value;
  }

  get ["2"]() {
    return this.rz;
  }

  set ["2"](value) {
    this.rz = value;
  }

  get ["3"]() {
    return this.rw;
  }

  set ["3"](value) {
    this.rw = value;
  }

  get ["4"]() {
    return this.dx;
  }

  set ["4"](value) {
    this.dx = value;
  }

  get ["5"]() {
    return this.dy;
  }

  set ["5"](value) {
    this.dy = value;
  }

  get ["6"]() {
    return this.dz;
  }

  set ["6"](value) {
    this.dz = value;
  }

  get ["7"]() {
    return this.dw;
  }

  set ["7"](value) {
    this.dw = value;
  }
}

const quat2Methods = [
  "fromRotationTranslation",
  "fromTranslation",
  "fromRotation",
  "fromMat4",
  "setReal",
  "setDual",
  "translate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "rotateByQuatAppend",
  "rotateByQuatPrepend",
  "rotateAroundAxis",
  "add",
  "multiply",
  "scale",
  "lerp",
  "invert",
  "conjugate",
  "normalize",
];

const quatMethods = ["getReal", "getDual"];

const vec3Methods = ["getTranslation"];

const voidMethods = [
  "dot",
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

for (const method of quat2Methods) {
  Quat2.prototype[method] = function (...args) {
    const out = new Quat2();
    quat2[method](out, this, ...args);
    return out;
  };
}

for (const method of quatMethods) {
  Quat2.prototype[method] = function (...args) {
    const out = new Quat();
    quat2[method](out, this, ...args);
    return out;
  };
}

for (const method of vec3Methods) {
  Quat2.prototype[method] = function (...args) {
    const out = new Vec3();
    quat2[method](out, this, ...args);
    return out;
  };
}

for (const method of voidMethods) {
  Quat2.prototype[method] = function (...args) {
    return quat2[method](this, ...args);
  };
}

for (const [from, to] of Object.entries(aliases)) {
  Quat2.prototype[from] = Quat2.prototype[to];
}
