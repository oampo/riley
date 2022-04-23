import type { Line } from "./line";
import { Vec2 } from "./math";

export function vertices(line: Line): Vec2[];
export function vertices(line: Line, vertices: Vec2[]): Line;
export function vertices(line: Line, vertices?: Vec2[]): Vec2[] | Line {
  if (!vertices) {
    return line.vertices;
  }

  return {
    ...line,
    vertices,
  };
}

export function weight(line: Line): number;
export function weight(line: Line, weight: number): Line;
export function weight(line: Line, weight?: number): number | Line {
  if (!weight) {
    return line.weight;
  }

  return {
    ...line,
    weight,
  };
}

export function layer(line: Line): number;
export function layer(line: Line, weight: number): Line;
export function layer(line: Line, layer?: number): number | Line {
  if (!layer) {
    return line.layer;
  }

  return {
    ...line,
    layer,
  };
}

export function mapVertices(
  line: Line,
  fn: (vertex: Vec2, index: number, array: Vec2[]) => Vec2
): Line {
  return {
    ...line,
    vertices: line.vertices.map(fn),
  };
}

export function pushVertices(line: Line, ...vertices: Vec2[]): Line {
  return {
    ...line,
    vertices: [...line.vertices, ...vertices],
  };
}
