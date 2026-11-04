import type { Line } from "./line";
import type { Vec2 } from "./math";

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

export function layer(line: Line): number;
export function layer(line: Line, layer: number): Line;
export function layer(line: Line, layer?: number): number | Line {
  if (!layer) {
    return line.layer;
  }

  return {
    ...line,
    layer,
  };
}

export function pen(line: Line): number;
export function pen(line: Line, pen: number): Line;
export function pen(line: Line, pen?: number): number | Line {
  if (!pen) {
    return line.pen;
  }

  return {
    ...line,
    pen,
  };
}

export function color(line: Line): number;
export function color(line: Line, color: number): Line;
export function color(line: Line, color?: number): number | Line {
  if (!color) {
    return line.color;
  }

  return {
    ...line,
    color,
  };
}

export function mapVertices(
  line: Line,
  fn: (vertex: Vec2, index: number, array: Vec2[]) => Vec2,
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
