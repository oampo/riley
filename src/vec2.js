import { vec2 } from "gl-matrix";

class Vec2 {
  constructor(x=0, y=0) {
    this._vec = vec2.fromValues(x, y)
  }

  clone() {
    return new Vec2(this._vec[0], this._vec[1]);
  }

  get x() {
    return this._vec[0];
  }

  get y() {
    return this._vec[1];
  }

  set x(value) {
    this._vec[0] = value;
  }

  set y(value) {
    this._vec[1] = value;
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
  "rotate"
];

const vec3Methods = [
  "cross"
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
  "equals"
];

const aliases = {
  div: "divide",
  dist: "distance",
  sqrDist: "squaredDistance",
  sqrLen: "squaredLength"
};

for (const method of vec2Methods) {
  Vec2.prototype[method] = function(...args) {
    const out = new Vec2();
    vec2[method](out._vec, this._vec, ...args);
    return out;
  }
}

for (const method of voidMethods) {
  Vec2.prototype[method] = function(...args) {
    return vec2[method](this._vec, ...args);
  }
}

for (const [from, to] of Object.entries(aliases)) {
  Vec2.prototype[from] = Vec2.prototype[to];
}
