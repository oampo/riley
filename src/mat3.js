import { mat3 } from "gl-matrix";

export default class Mat3 {
  constructor(
    m00 = 1,
    m01 = 0,
    m02 = 0,
    m10 = 0,
    m11 = 1,
    m12 = 0,
    m20 = 0,
    m21 = 0,
    m22 = 1
  ) {
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
    this.m20 = m20;
    this.m21 = m21;
    this.m22 = m22;
  }

  clone() {
    return new Mat3(
      this.m00,
      this.m01,
      this.m02,
      this.m10,
      this.m11,
      this.m12,
      this.m20,
      this.m21,
      this.m22
    );
  }

  get ["0"]() {
    return this.m00;
  }

  get ["1"]() {
    return this.m01;
  }

  get ["2"]() {
    return this.m02;
  }

  get ["3"]() {
    return this.m10;
  }

  get ["4"]() {
    return this.m11;
  }

  get ["5"]() {
    return this.m12;
  }

  get ["6"]() {
    return this.m20;
  }

  get ["7"]() {
    return this.m21;
  }

  get ["8"]() {
    return this.m22;
  }

  set ["0"](value) {
    this.m00 = value;
  }

  set ["1"](value) {
    this.m01 = value;
  }

  set ["2"](value) {
    this.m02 = value;
  }

  set ["3"](value) {
    this.m10 = value;
  }

  set ["4"](value) {
    this.m11 = value;
  }

  set ["5"](value) {
    this.m12 = value;
  }

  set ["6"](value) {
    this.m20 = value;
  }

  set ["7"](value) {
    this.m21 = value;
  }

  set ["8"](value) {
    this.m22 = value;
  }
}

const mat3Methods = [
  "fromMat4",
  "transpose",
  "invert",
  "adjoint",
  "multiply",
  "translate",
  "rotate",
  "scale",
  "fromTranslation",
  "fromRotation",
  "fromScaling",
  "fromMat2",
  "fromQuat",
  "normalFromMat4",
  "projection",
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

for (const method of mat3Methods) {
  Mat3.prototype[method] = function (...args) {
    const out = new Mat3();
    mat3[method](out, this, ...args);
    return out;
  };
}

for (const method of voidMethods) {
  Mat3.prototype[method] = function (...args) {
    return mat3[method](this, ...args);
  };
}

for (const [from, to] of Object.entries(aliases)) {
  Mat3.prototype[from] = Mat3.prototype[to];
}
