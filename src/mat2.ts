import { mat2 } from "gl-matrix";

export default class Mat2 {
  m00: number;
  m01: number;
  m10: number;
  m11: number;

  constructor(m00 = 1, m01 = 0, m10 = 0, m11 = 1) {
    this.m00 = m00;
    this.m01 = m01;
    this.m10 = m10;
    this.m11 = m11;
  }

  clone() {
    return new Mat2(this.m00, this.m01, this.m10, this.m11);
  }

  get ["0"]() {
    return this.m00;
  }

  set ["0"](value) {
    this.m00 = value;
  }

  get ["1"]() {
    return this.m01;
  }

  set ["1"](value) {
    this.m01 = value;
  }

  get ["2"]() {
    return this.m10;
  }

  set ["2"](value) {
    this.m10 = value;
  }

  get ["3"]() {
    return this.m11;
  }

  set ["3"](value) {
    this.m11 = value;
  }
}

const mat2Methods = [
  "transpose",
  "invert",
  "adjoint",
  "multiply",
  "rotate",
  "scale",
  "fromRotation",
  "fromScaling",
  "add",
  "subtract",
  "multiplyScalar",
  "multiplyScalarAndAdd",
];

const voidMethods = ["determinant", "str", "frob", "exactEquals", "equals"];

const aliases = {
  sub: "subtract",
  mul: "multiply",
};

for (const method of mat2Methods) {
  Mat2.prototype[method] = function (...args) {
    const out = new Mat2();
    mat2[method](out, this, ...args);
    return out;
  };
}

for (const method of voidMethods) {
  Mat2.prototype[method] = function (...args) {
    return mat2[method](this, ...args);
  };
}

for (const [from, to] of Object.entries(aliases)) {
  Mat2.prototype[from] = Mat2.prototype[to];
}
