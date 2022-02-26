import type { Line } from "./line";

import { vec2, Vec2 } from "./math";
import line from "./line";
import { spatialHashRastered, SpatialHash } from "./spatial-hash";

export function boundingBox(line: Line) {
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

export function segmentIntersectsSegment(
  startA: Vec2,
  endA: Vec2,
  startB: Vec2,
  endB: Vec2
): Vec2 | null {
  const diffA = endA.sub(startA);
  const diffB = endB.sub(startB);

  const diffStarts = startB.sub(startA);

  const crossA = diffStarts.cross(diffA).z;
  const crossB = diffStarts.cross(diffB).z;
  const crossAB = diffA.cross(diffB).z;

  const s = crossA / crossAB;
  const t = crossB / crossAB;

  if (s > 0 && s < 1 && t > 0 && t < 1) {
    return startA.add(diffA.scale(t));
  }
  return null;
}

interface Intersection {
  vertex: Vec2;
  segmentIndexA: number;
  segmentIndexB: number;
}

function lineIntersectsLineBruteForce(
  lineA: Line,
  lineB: Line
): Intersection[] {
  const { vertices: verticesA } = lineA;
  const { vertices: verticesB } = lineB;
  const intersections = [];

  for (let i = 0; i < verticesA.length - 1; i++) {
    const startA = verticesA[i];
    const endA = verticesA[i + 1];

    for (let j = 0; j < verticesB.length - 1; j++) {
      const startB = verticesB[j];
      const endB = verticesB[j + 1];

      const intersection = segmentIntersectsSegment(startA, endA, startB, endB);
      if (intersection) {
        intersections.push({
          vertex: intersection,
          segmentIndexA: i,
          segmentIndexB: j,
        });
      }
    }
  }

  return intersections;
}

function lineIntersectsLineHashed(
  lineA: Line,
  lineB: Line,
  hashA: SpatialHash<number>,
  hashB: SpatialHash<number>
): Intersection[] {
  const { vertices: verticesA } = lineA;
  const { vertices: verticesB } = lineB;
  const intersections = [];

  // Keep a set of line segments which we've already compared, so we don't
  // check them more than once even if they appear together in more than
  // one cell
  const checked = new Set();

  for (const [hash, segmentIndicesA] of hashA.entries()) {
    if (!(hash in hashB)) {
      continue;
    }

    const segmentIndicesB = hashB.getByHash(hash);

    for (let i = 0; i < segmentIndicesA.length; i++) {
      const segmentIndexA = segmentIndicesA[i];
      const startA = verticesA[segmentIndexA];
      const endA = verticesA[segmentIndexA + 1];

      for (let j = 0; j < segmentIndicesB.length; j++) {
        const segmentIndexB = segmentIndicesB[j];

        const pair = `${segmentIndexA},${segmentIndexB}`;
        if (checked.has(pair)) {
          continue;
        }

        const startB = verticesB[segmentIndexB];
        const endB = verticesB[segmentIndexB + 1];
        const intersection = segmentIntersectsSegment(
          startA,
          endA,
          startB,
          endB
        );
        if (intersection) {
          intersections.push({
            vertex: intersection,
            segmentIndexA,
            segmentIndexB,
          });
        }

        checked.add(pair);
      }
    }
  }

  return intersections;
}

interface LineIntersectsLineOptions {
  sort?: boolean;
  hashA?: SpatialHash<number>;
  hashB?: SpatialHash<number>;
}

export function lineIntersectsLine(
  lineA: Line,
  lineB: Line,
  { sort = false, hashA, hashB }: LineIntersectsLineOptions = {}
) {
  const { vertices: verticesA } = lineA;

  let intersections;
  if (hashA && !hashB) {
    hashB = spatialHashRastered(lineB, { gridSize: hashA.gridSize });
  } else if (!hashA && hashB) {
    hashA = spatialHashRastered(lineA, { gridSize: hashB.gridSize });
  }

  if (hashA && hashB) {
    intersections = lineIntersectsLineHashed(lineA, lineB, hashA, hashB);
  } else {
    intersections = lineIntersectsLineBruteForce(lineA, lineB);
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

export function polygonContainsPoint(
  polygon: Line,
  point: Vec2,
  { polygonHash }: { polygonHash?: SpatialHash<number> }
) {
  const { topLeft } = boundingBox(polygon);

  // Create a line from outside the polygon to the point
  const start = topLeft.sub(vec2(1, 1));
  const l = line(start, point);
  const intersections = lineIntersectsLine(l, polygon, { hashB: polygonHash });

  // If there are an even number of intersections, the point is inside the polygon
  return intersections.length % 2 === 1;
}

export function aabbContainsPoint(center: Vec2, size: Vec2, point: Vec2) {
  return (
    point.x >= center.x - size.x / 2 &&
    point.x <= center.x + size.x / 2 &&
    point.y >= center.y - size.y / 2 &&
    point.y <= center.y + size.y / 2
  );
}
