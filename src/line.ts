import config from "./config";
import Vec2 from "./vec2";
import Vec4 from "./vec4";

export interface Line {
  vertices: Vec2[];
  color: Vec4;
  weight: number;
  layer: number;
}

export default function line(...vertices: Vec2[]): Line {
  return {
    vertices,
    color: config.defaultColor,
    weight: config.defaultWeight,
    layer: 0,
  };
}
