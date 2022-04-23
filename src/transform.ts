import type { Line } from "./line";
import { vec2, Vec2, Mat3 } from "./math";

export function translate(line: Line, translation: Vec2): Line {
  return {
    ...line,
    vertices: line.vertices.map((v) => v.add(translation)),
  };
}

export function scale(line: Line, scale: Vec2): Line {
  return {
    ...line,
    vertices: line.vertices.map((v) => v.mul(scale)),
  };
}

export function rotate(
  line: Line,
  rotation: number,
  { center = vec2() } = {}
): Line {
  return {
    ...line,
    vertices: line.vertices.map((v) => v.rotate(center, rotation)),
  };
}

export function transform(line: Line, transform: Mat3): Line {
  return {
    ...line,
    vertices: line.vertices.map((v) => v.transformMat3(transform)),
  };
}
