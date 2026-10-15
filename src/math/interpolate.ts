import { clamp } from "./range";

export type FirstOrderInterpolationFn = (
  a: number,
  b: number,
  x: number,
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
