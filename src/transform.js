import { vec2 } from "gl-matrix";

export function translate(line, translation) {
  for (const vertex of line.vertices) {
    vec2.add(vertex, vertex, translation);
  }
  return line;
}

export function scale(line, scale) {
  for (const vertex of line.vertices) {
    vec2.mul(vertex, vertex, scale);
  }
  return line;
}

export function rotate(line, rotation) {
  const origin = vec2.create();
  for (const vertex of line.vertices) {
    vec2.rotate(vertex, vertex, origin, rotation);
  }
  return line;
}

export function transform(line, transform) {
  for (const vertex of line.vertices) {
    vec2.transformMat3(vertex, vertex, transform);
  }
  return line;
}
