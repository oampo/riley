import { vec2 } from "./math";
import { line } from "./shape";
import { spatialHashRastered } from "./spatial-hash";

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

export function segmentIntersectsSegment(startA, endA, startB, endB) {
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

function lineIntersectsLineBruteForce(lineA, lineB) {
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

function lineIntersectsLineHashed(lineA, lineB, hashA, hashB) {
  const { vertices: verticesA } = lineA;
  const { vertices: verticesB } = lineB;
  const intersections = [];

  // Keep a set of line segments which we've already compared, so we don't
  // check them more than once even if they appear together in more than
  // one cell
  const checked = new Set();

  for (const [hash, segmentIndicesA] of Object.entries(hashA)) {
    if (!(hash in hashB)) {
      continue;
    }

    const segmentIndicesB = hashB[hash];

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

export function lineIntersectsLine(
  lineA,
  lineB,
  { sort = false, hashA, hashB } = {}
) {
  const { vertices: verticesA } = lineA;

  let intersections;
  if (hashA || hashB) {
    if (!hashA) {
      hashA = spatialHashRastered(lineA, { gridSize: hashB.gridSize });
    }
    if (!hashB) {
      hashB = spatialHashRastered(lineB, { gridSize: hashA.gridSize });
    }
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

export function polygonContainsPoint(polygon, point, { polygonHash }) {
  const { topLeft } = boundingBox(polygon);

  // Create a line from outside the polygon to the point
  const start = topLeft.sub(vec2(1, 1));
  const l = line(start, point);
  const intersections = lineIntersectsLine(l, polygon, { hashB: polygonHash });

  // If there are an even number of intersections, the point is inside the polygon
  return intersections.length % 2 === 1;
}

export function aabbContainsPoint(center, size, point) {
  return (
    point.x >= center.x - size.x / 2 &&
    point.x <= center.x + size.x / 2 &&
    point.y >= center.y - size.y / 2 &&
    point.y <= center.y + size.y / 2
  );
}
