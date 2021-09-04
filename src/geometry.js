import { vec2, vec3 } from "gl-matrix";
import { line } from "./shape";

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

export function lineIntersectsLine(lineA, lineB, { sort = false } = {}) {
  const { vertices: verticesA } = lineA;
  const { vertices: verticesB } = lineB;
  const intersections = [];
  for (let i = 0; i < verticesA.length - 1; i++) {
    const startA = verticesA[i];
    const endA = verticesA[i + 1];
    const diffA = vec2.sub(vec2.create(), endA, startA);

    for (let j = 0; j < verticesB.length - 1; j++) {
      const startB = verticesB[j];
      const endB = verticesB[j + 1];
      const diffB = vec2.sub(vec2.create(), endB, startB);

      const diffStarts = vec2.sub(vec2.create(), startB, startA);

      const crossA = vec2.cross(vec3.create(), diffStarts, diffA)[2];
      const crossB = vec2.cross(vec3.create(), diffStarts, diffB)[2];
      const crossAB = vec2.cross(vec3.create(), diffA, diffB)[2];

      const s = crossA / crossAB;
      const t = crossB / crossAB;

      if (s > 0 && s < 1 && t > 0 && t < 1) {
        intersections.push({
          vertex: vec2.add(
            vec2.create(),
            startA,
            vec2.scale(vec2.create(), diffA, t)
          ),
          segmentIndexA: i,
          segmentIndexB: j,
        });
      }
    }
  }

  if (sort) {
    intersections.sort((a, b) => {
      if (a.segmentIndexA === b.segmentIndexA) {
        const distA = vec2.sqrDist(a.vertex, verticesA[a.segmentIndexA]);
        const distB = vec2.sqrDist(b.vertex, verticesA[a.segmentIndexA]);
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
  const start = vec2.subtract(topLeft, topLeft, vec2.fromValues(1, 1));
  const l = line(start, point);
  const intersections = lineIntersectsLine(l, polygon);

  // If there are an even number of intersections, the point is inside the polygon
  return intersections.length % 2 === 1;
}
