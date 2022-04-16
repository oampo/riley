import config from "./config";
import { Vec2, Vec4 } from "./math";

export interface Line {
  vertices: Vec2[];
  color: Vec4;
  weight: number;
  layer: number;
}

export function line(...vertices: Vec2[]): Line {
  return {
    vertices,
    color: config.defaultColor,
    weight: config.defaultWeight,
    layer: 0,
  };
}
