import { vec2 } from "gl-matrix";

export function length(...lines) {
  let length = 0;
  for (const { vertices } of lines) {
    for (let i = 0; i < vertices.length - 1; i++) {
      length += vec2.dist(vertices[i], vertices[i + 1]);
    }
  }
  return length;
}

export function penDistance(...lines) {
  let distance = length(...lines);
  lines = lines.filter(({ vertices }) => vertices.length);
  for (let i = 0; i < lines.length - 1; i++) {
    const verticesA = lines[i].vertices;
    const verticesB = lines[i + 1].vertices;
    distance += vec2.dist(verticesA[verticesA.length - 1], verticesB[0]);
  }

  return distance;
}
