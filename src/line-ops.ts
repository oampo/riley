import type { Line } from "./line";

export function clone(line: Line): Line {
  return {
    ...line,
    vertices: [...line.vertices],
    color: line.color.clone(),
  };
}

export function subdivide(line: Line, maxDistance: number): Line {
  const newVertices = [];
  for (let i = 0; i < line.vertices.length - 1; i++) {
    const vertexA = line.vertices[i];
    const vertexB = line.vertices[i + 1];
    const distance = vertexA.dist(vertexB);

    newVertices.push(vertexA.clone());
    if (distance > maxDistance) {
      const verticesBetween = Math.floor(distance / maxDistance);
      for (let j = 0; j < verticesBetween; j++) {
        newVertices.push(vertexA.lerp(vertexB, j / (verticesBetween + 1)));
      }
    }
    newVertices.push(vertexB.clone());
  }
  return {
    ...line,
    vertices: newVertices,
  };
}
