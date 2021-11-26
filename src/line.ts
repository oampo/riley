import Vec2 from "./vec2";
import Vec4 from "./vec4";

export default interface Line {
  vertices: Array<Vec2>;
  color: Vec4;
  weight: number;
  layer: number;
}
