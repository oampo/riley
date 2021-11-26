export function clone(line) {
  return {
    vertices: [...line.vertices],
    ...line,
  };
}

export function subdivide(line, maxDistance) {
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
  line.vertices = newVertices;
  return line;
}
