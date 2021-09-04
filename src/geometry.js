import { vec2 } from "gl-matrix";

export function boundingBox(line) {
  if (!line.vertices.length) {
    return {
      topLeft: vec2.create(),
      bottomRight: vec2.create(),
      size: vec2.create(),
      center: vec2.create(),
    };
  }

  let topLeft = vec2.fromValues(Infinity, Infinity);
  let bottomRight = vec2.fromValues(-Infinity, -Infinity);

  for (const vertex of line.vertices) {
    vec2.min(topLeft, topLeft, vertex);
    vec2.max(bottomRight, bottomRight, vertex);
  }

  const size = vec2.sub(vec2.create(), bottomRight, topLeft);
  const center = vec2.lerp(vec2.create(), bottomRight, topLeft, 0.5);

  return { topLeft, bottomRight, size, center };
}
