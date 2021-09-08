import { mat2d } from "gl-matrix";

export default class Mat2d {
  constructor(m00 = 1, m01 = 0, m10 = 0, m11 = 1, m20 = 0, m21 = 0) {
    this.m00 = m00;
    this.m01 = m01;
    this.m10 = m10;
    this.m11 = m11;
    this.m20 = m20;
    this.m21 = m21;
  }

  clone() {
    return new Mat2d(
      this.m00,
      this.m01,
      this.m10,
      this.m11,
      this.m20,
      this.m21
    );
  }

  get ["0"]() {
    return this.m00;
  }

  get ["1"]() {
    return this.m01;
  }

  get ["2"]() {
    return this.m10;
  }

  get ["3"]() {
    return this.m11;
  }

  get ["4"]() {
    return this.m20;
  }

  get ["5"]() {
    return this.m21;
  }

  set ["0"](value) {
    this.m00 = value;
  }

  set ["1"](value) {
    this.m01 = value;
  }

  set ["2"](value) {
    this.m10 = value;
  }

  set ["3"](value) {
    this.m11 = value;
  }

  set ["4"](value) {
    this.m20 = value;
  }

  set ["5"](value) {
    this.m21 = value;
  }
}

const mat2dMethods = [
  "invert",
  "multiply",
  "rotate",
  "scale",
  "translate",
  "fromRotation",
  "fromScaling",
  "fromTranslation",
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

for (const method of mat2dMethods) {
  Mat2d.prototype[method] = function (...args) {
    const out = new Mat2d();
    mat2d[method](out, this, ...args);
    return out;
  };
}

for (const method of voidMethods) {
  Mat2d.prototype[method] = function (...args) {
    return mat2d[method](this, ...args);
  };
}

for (const [from, to] of Object.entries(aliases)) {
  Mat2d.prototype[from] = Mat2d.prototype[to];
}
