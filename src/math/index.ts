import config from "../config";

export * from "./vec/vec2";
export * from "./vec/vec3";
export * from "./vec/vec4";
export * from "./mat/mat2";
export * from "./mat/mat2d";
export * from "./mat/mat3";
export * from "./mat/mat4";
export * from "./quat/quat";
export * from "./quat/quat2";

export function remap(
  value: number,
  fromStart: number,
  fromStop: number,
  toStart: number,
  toStop: number
): number {
  const fromRange = fromStop - fromStart;
  const toRange = toStop - toStart;
  return toStart + (toRange * (value - fromStart)) / fromRange;
}

export function clamp(a: number, min: number, max: number) {
  if (a < min) {
    return min;
  } else if (a > max) {
    return max;
  }
  return a;
}

export type FirstOrderInterpolationFn = (
  a: number,
  b: number,
  x: number
) => number;

export const lerp: FirstOrderInterpolationFn = function (a, b, x) {
  return a + x * (b - a);
};

export const smoothstep: FirstOrderInterpolationFn = function (a, b, x) {
  x = clamp((x - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

export const smootherstep: FirstOrderInterpolationFn = function (a, b, x) {
  x = clamp((x - a) / (b - a), 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

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
