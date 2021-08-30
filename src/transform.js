import { vec2 } from "gl-matrix";

export function translate(group, translation) {
  for (const line of group.lines) {
    for (const vertex of line) {
      vec2.add(vertex, vertex, translation);
    }
  }
  return group;
}

export function scale(group, scale) {
  for (const line of group.lines) {
    for (const vertex of line) {
      vec2.mul(vertex, vertex, scale);
    }
  }
  return group;
}

export function rotate(group, rotation) {
  const origin = vec2.create();
  for (const line of group.lines) {
    for (const vertex of line) {
      vec2.rotate(vertex, vertex, origin, rotation);
    }
  }
  return group;
}

export function transform(group, transform) {
  for (const line of group.lines) {
    for (const vertex of line) {
      vec2.transformMat3(vertex, vertex, transform);
    }
  }
  return group;
}
