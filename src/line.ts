import type { RgbaColor } from "./color";
import { getConfig } from "./config";
import type { Vec2 } from "./math";

export interface Line {
  readonly vertices: Vec2[];
  readonly color: RgbaColor;
  readonly weight: number;
  readonly layer: number;
}

export function line(...vertices: Vec2[]): Line {
  return {
    vertices,
    color: getConfig().defaultColor,
    weight: getConfig().defaultWeight,
    layer: 0,
  };
}
