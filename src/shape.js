import { vec2 } from "gl-matrix";
import config from "./config";

export function line(...vertices) {
  return [
    {
      vertices,
      color: config.defaultColor,
      weight: config.defaultWeight,
      layer: 0,
    },
  ];
}

export function rect(center, size) {
  return line(
    vec2.fromValues(center[0] - size[0] / 2, center[1] - size[1] / 2),
    vec2.fromValues(center[0] - size[0] / 2, center[1] + size[1] / 2),
    vec2.fromValues(center[0] + size[0] / 2, center[1] + size[1] / 2),
    vec2.fromValues(center[0] + size[0] / 2, center[1] - size[1] / 2),
    vec2.fromValues(center[0] - size[0] / 2, center[1] - size[1] / 2)
  );
}
