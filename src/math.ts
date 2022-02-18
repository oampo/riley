import config from "./config";

import Vec2 from "./vec2";
import Vec3 from "./vec3";
import Vec4 from "./vec4";
import Mat2 from "./mat2";
import Mat2d from "./mat2d";
import Mat3 from "./mat3";
import Mat4 from "./mat4";
import Quat from "./quat";
import Quat2 from "./quat2";

export { Vec2, Vec3, Vec4, Mat2, Mat2d, Mat3, Mat4, Quat, Quat2 };

export function vec2(x = 0, y = 0) {
  return new Vec2(x, y);
}

export function vec3(x = 0, y = 0, z = 0) {
  return new Vec3(x, y, z);
}

export function vec4(x = 0, y = 0, z = 0, w = 0) {
  return new Vec4(x, y, z, w);
}

export function mat2(m00 = 1, m01 = 0, m10 = 0, m11 = 1) {
  return new Mat2(m00, m01, m10, m11);
}

export function mat2d(m00 = 1, m01 = 0, m10 = 0, m11 = 1, m20 = 0, m21 = 0) {
  return new Mat2d(m00, m01, m10, m11, m20, m21);
}

export function mat3(
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
  return new Mat3(m00, m01, m02, m10, m11, m12, m20, m21, m22);
}

export function mat4(
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
  return new Mat4(
    m00,
    m01,
    m02,
    m03,
    m10,
    m11,
    m12,
    m13,
    m20,
    m21,
    m22,
    m23,
    m30,
    m31,
    m32,
    m33
  );
}

export function quat(x = 0, y = 0, z = 0, w = 1): Quat {
  return new Quat(x, y, z, w);
}

export function quat2(
  rx = 0,
  ry = 0,
  rz = 0,
  rw = 0,
  dx = 0,
  dy = 0,
  dz = 0,
  dw = 1
): Quat2 {
  return new Quat2(rx, ry, rz, rw, dx, dy, dz, dw);
}

export function remap(value, fromStart, fromStop, toStart, toStop) {
  const fromRange = fromStop - fromStart;
  const toRange = toStop - toStart;
  return toStart + (toRange * (value - fromStart)) / fromRange;
}

export function clamp(a, min, max) {
  if (a < min) {
    return min;
  } else if (a > max) {
    return max;
  }
  return a;
}

export function lerp(a, b, x) {
  return a + x * (b - a);
}

export function smoothstep(a, b, x) {
  x = clamp((x - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
}

export function smootherstep(a, b, x) {
  x = clamp((x - a) / (b - a), 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function floatEq(
  a: number,
  b: number,
  {
    epsilon = config.epsilon,
    threshold = config.absoluteComparisonThreshold,
  } = {}
) {
  if (a === b) return true;

  const diff = Math.abs(a - b);
  const norm = Math.min(Math.abs(a + b), Number.MAX_VALUE);
  return diff < Math.max(threshold, epsilon * norm);
}
