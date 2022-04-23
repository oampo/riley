import config from "./config";
import { Vec2, Vec4 } from "./math";

export interface Line {
  readonly vertices: Vec2[];
  readonly color: Vec4;
  readonly weight: number;
  readonly layer: number;
}

export function line(...vertices: Vec2[]): Line {
  return {
    vertices,
    color: config.defaultColor,
    weight: config.defaultWeight,
    layer: 0,
  };
}
