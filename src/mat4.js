import { mat4 } from "gl-matrix";

import Vec3 from "./vec3";
import Quat from "./quat";

export default class Mat4 {
  constructor(
    m00 = 1,
    m01 = 0,
    m02 = 0,
    m03 = 0,
    m10 = 0,
    m11 = 1,
    m12 = 0,
    m13 = 0,
    m20 = 0,
    m21 = 0,
    m22 = 1,
    m23 = 0,
    m30 = 0,
    m31 = 0,
    m32 = 0,
    m33 = 1
  ) {
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m03 = m03;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
    this.m13 = m13;
    this.m20 = m20;
    this.m21 = m21;
    this.m22 = m22;
    this.m23 = m23;
    this.m30 = m30;
    this.m31 = m31;
    this.m32 = m32;
    this.m33 = m33;
  }

  clone() {
    return new Mat4(
      this.m00,
      this.m01,
      this.m02,
      this.m03,
      this.m10,
      this.m11,
      this.m12,
      this.m13,
      this.m20,
      this.m21,
      this.m22,
      this.m23,
      this.m30,
      this.m31,
      this.m32,
      this.m33
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
    return this.m03;
  }

  get ["4"]() {
    return this.m10;
  }

  get ["5"]() {
    return this.m11;
  }

  get ["6"]() {
    return this.m12;
  }

  get ["7"]() {
    return this.m13;
  }

  get ["8"]() {
    return this.m20;
  }

  get ["9"]() {
    return this.m21;
  }

  get ["10"]() {
    return this.m22;
  }

  get ["11"]() {
    return this.m23;
  }

  get ["12"]() {
    return this.m30;
  }

  get ["13"]() {
    return this.m31;
  }

  get ["14"]() {
    return this.m32;
  }

  get ["15"]() {
    return this.m33;
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
    this.m03 = value;
  }

  set ["4"](value) {
    this.m10 = value;
  }

  set ["5"](value) {
    this.m11 = value;
  }

  set ["6"](value) {
    this.m12 = value;
  }

  set ["7"](value) {
    this.m13 = value;
  }

  set ["8"](value) {
    this.m20 = value;
  }

  set ["9"](value) {
    this.m21 = value;
  }

  set ["10"](value) {
    this.m22 = value;
  }

  set ["11"](value) {
    this.m23 = value;
  }

  set ["12"](value) {
    this.m30 = value;
  }

  set ["13"](value) {
    this.m31 = value;
  }

  set ["14"](value) {
    this.m32 = value;
  }

  set ["15"](value) {
    this.m33 = value;
  }
}

const mat4Methods = [
  "transpose",
  "invert",
  "adjoint",
  "multiply",
  "translate",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "fromTranslation",
  "fromScaling",
  "fromRotation",
  "fromXRotation",
  "fromYRotation",
  "fromZRotation",
  "fromRotationTranslation",
  "fromQuat2",
  "fromRotationTranslationScale",
  "fromRotationTranslationScaleOrigin",
  "fromQuat",
  "frustum",
  "perspective",
  "perspectiveFromFieldOfView",
  "ortho",
  "lookAt",
  "targetTo",
  "add",
  "subtract",
  "multiplyScalar",
  "multiplyScalarAndAdd",
];

const vec3Methods = ["getTranslation", "getScaling"];
const quatMethods = ["getRotation"];

const voidMethods = ["determinant", "str", "frob", "exactEquals", "equals"];

const aliases = {
  sub: "subtract",
  mul: "multiply",
};

for (const method of mat4Methods) {
  Mat4.prototype[method] = function (...args) {
    const out = new Mat4();
    mat4[method](out, this, ...args);
    return out;
  };
}

for (const method of vec3Methods) {
  Mat4.prototype[method] = function (...args) {
    const out = new Vec3();
    mat4[method](out, this, ...args);
    return out;
  };
}

for (const method of quatMethods) {
  Mat4.prototype[method] = function (...args) {
    const out = new Quat();
    mat4[method](out, this, ...args);
    return out;
  };
}

for (const method of voidMethods) {
  Mat4.prototype[method] = function (...args) {
    return mat4[method](this, ...args);
  };
}

for (const [from, to] of Object.entries(aliases)) {
  Mat4.prototype[from] = Mat4.prototype[to];
}
