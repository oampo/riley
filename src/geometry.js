import { vec2 } from "./math";
import { line } from "./shape";

export function boundingBox(line) {
  if (!line.vertices.length) {
    return {
      topLeft: vec2(),
      bottomRight: vec2(),
      size: vec2(),
      center: vec2(),
    };
  }

  let topLeft = vec2(Infinity, Infinity);
  let bottomRight = vec2(-Infinity, -Infinity);

  for (const vertex of line.vertices) {
    topLeft = topLeft.min(vertex);
    bottomRight = bottomRight.max(vertex);
  }

  const size = bottomRight.sub(topLeft);
  const center = bottomRight.lerp(topLeft, 0.5);

  return { topLeft, bottomRight, size, center };
}

export function lineIntersectsLine(lineA, lineB, { sort = false } = {}) {
  const { vertices: verticesA } = lineA;
  const { vertices: verticesB } = lineB;
  const intersections = [];
  for (let i = 0; i < verticesA.length - 1; i++) {
    const startA = verticesA[i];
    const endA = verticesA[i + 1];
    const diffA = endA.sub(startA);

    for (let j = 0; j < verticesB.length - 1; j++) {
      const startB = verticesB[j];
      const endB = verticesB[j + 1];
      const diffB = endB.sub(startB);

      const diffStarts = startB.sub(startA);

      const crossA = diffStarts.cross(diffA).z;
      const crossB = diffStarts.cross(diffB).z;
      const crossAB = diffA.cross(diffB).z;

      const s = crossA / crossAB;
      const t = crossB / crossAB;

      if (s > 0 && s < 1 && t > 0 && t < 1) {
        intersections.push({
          vertex: startA.add(diffA.scale(t)),
          segmentIndexA: i,
          segmentIndexB: j,
        });
      }
    }
  }

  if (sort) {
    intersections.sort((a, b) => {
      if (a.segmentIndexA === b.segmentIndexA) {
        const distA = a.vertex.sqrDist(verticesA[a.segmentIndexA]);
        const distB = b.vertex.sqrDist(verticesA[a.segmentIndexA]);
        return distA - distB;
      }
      return a.segmentIndexA - b.segmentIndexA;
    });
  }

  return intersections;
}

export function polygonContainsPoint(polygon, point) {
  const { topLeft } = boundingBox(polygon);

  // Create a line from outside the polygon to the point
  const start = topLeft.sub(vec2(1, 1));
  const l = line(start, point);
  const intersections = lineIntersectsLine(l, polygon);

  // If there are an even number of intersections, the point is inside the polygon
  return intersections.length % 2 === 1;
}
