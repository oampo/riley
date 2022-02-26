import type { Line } from "./line";

export function length(...lines: Line[]): number {
  let length = 0;
  for (const { vertices } of lines) {
    for (let i = 0; i < vertices.length - 1; i++) {
      length += vertices[i].dist(vertices[i + 1]);
    }
  }
  return length;
}

export function penDistance(...lines: Line[]): number {
  let distance = length(...lines);
  lines = lines.filter(({ vertices }) => vertices.length);
  for (let i = 0; i < lines.length - 1; i++) {
    const verticesA = lines[i].vertices;
    const verticesB = lines[i + 1].vertices;
    distance += verticesA[verticesA.length - 1].dist(verticesB[0]);
  }

  return distance;
}
