import Vec2 from "./vec2";
import Vec3 from "./vec3";
import Vec4 from "./vec4";
import Mat2 from "./mat2";
import Mat2d from "./mat2d";
import Mat3 from "./mat3";
import Mat4 from "./mat4";
import Quat from "./quat";
import Quat2 from "./quat2";

export function mapRange(value, fromStart, fromStop, toStart, toStop) {
  const fromRange = fromStop - fromStart;
  const toRange = toStop - toStart;
  return toStart + (toRange * (value - fromStart)) / fromRange;
}

export function vec2(x, y) {
  return new Vec2(x, y);
}

export function vec3(x, y, z) {
  return new Vec3(x, y, z);
}

export function vec4(x, y, z, w) {
  return new Vec4(x, y, z, w);
}

export function mat2(m00, m01, m10, m11) {
  return new Mat2(m00, m01, m10, m11);
}

export function mat2d(m00, m01, m10, m11, m20, m21) {
  return new Mat2d(m00, m01, m10, m11, m20, m21);
}

export function mat3(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  return new Mat3(m00, m01, m02, m10, m11, m12, m20, m21, m22);
}

export function mat4(
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

export function quat(x, y, z, w) {
  return new Quat(x, y, z, w);
}

export function quat2(rx, ry, rz, rw, dx, dy, dz, dw) {
  return new Quat2(rx, ry, rz, rw, dx, dy, dz, dw);
}
