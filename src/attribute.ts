import Line from "./line";
import { Vec2 } from "./math";

export function vertices(line: Line): Vec2[];
export function vertices(line: Line, vertices: Vec2[]): Line;
export function vertices(line: Line, vertices?: Vec2[]): Vec2[] | Line {
  if (!vertices) {
    return line.vertices;
  }

  line.vertices = vertices;
  return line;
}

export function weight(line: Line): number;
export function weight(line: Line, weight: number): Line;
export function weight(line: Line, weight?: number): number | Line {
  if (!weight) {
    return line.weight;
  }

  line.weight = weight;
  return line;
}

export function layer(line: Line): number;
export function layer(line: Line, weight: number): Line;
export function layer(line: Line, layer?: number): number | Line {
  if (!layer) {
    return line.layer;
  }

  line.layer = layer;
  return line;
}

export function mapVertices(
  line: Line,
  fn: (vertex: Vec2, index: number, array: Vec2[]) => Vec2
): Line {
  line.vertices = line.vertices.map(fn);
  return line;
}

export function pushVertices(line: Line, ...vertices: Vec2[]): Line {
  line.vertices.push(...vertices);
  return line;
}
