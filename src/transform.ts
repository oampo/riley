import type { Line } from "./line";
import { vec2, Vec2, Mat3 } from "./math";

export function translate(line: Line, translation: Vec2): Line {
  line.vertices = line.vertices.map((v) => v.add(translation));
  return line;
}

export function scale(line: Line, scale: Vec2): Line {
  line.vertices = line.vertices.map((v) => v.mul(scale));
  return line;
}

export function rotate(
  line: Line,
  rotation: number,
  { center = vec2() } = {}
): Line {
  line.vertices = line.vertices.map((v) => v.rotate(center, rotation));
  return line;
}

export function transform(line: Line, transform: Mat3): Line {
  line.vertices = line.vertices.map((v) => v.transformMat3(transform));
  return line;
}
