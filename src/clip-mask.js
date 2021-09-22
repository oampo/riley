import { line } from "./shape";
import { lineIntersectsLine, polygonContainsPoint } from "./geometry";

export function clip(l, polygon, { lineHash, polygonHash } = {}) {
  if (!l.vertices.length) {
    return [l];
  }
  if (!polygon.vertices.length) {
    return [line()];
  }

  const intersections = lineIntersectsLine(l, polygon, {
    sort: true,
    hashA: lineHash,
    hashB: polygonHash,
  });

  if (!intersections.length) {
    if (polygonContainsPoint(polygon, l.vertices[0], { polygonHash })) {
      // Entire line is inside the polygon
      return [l];
    }
    // Entire line is outside the polygon
    return [];
  }

  let inside = polygonContainsPoint(polygon, l.vertices[0], { polygonHash });
  let start = l.vertices[0];
  let segmentIndex = 0;
  const new_lines = [];
  for (let i = 0; i < intersections.length; i++) {
    const intersection = intersections[i];
    if (inside) {
      const new_line = line(
        start,
        ...l.vertices.slice(segmentIndex + 1, intersection.segmentIndexA + 1),
        intersection.vertex
      );
      new_lines.push(new_line);
    } else {
      start = intersection.vertex;
      segmentIndex = intersection.segmentIndexA;
    }

    inside = !inside;
  }

  if (inside) {
    // The last intersection took us inside the polygon, so the line must end
    // inside
    const new_line = line(start, ...l.vertices.slice(segmentIndex + 1));
    new_lines.push(new_line);
  }

  return new_lines;
}

export function mask(l, polygon, { lineHash, polygonHash } = {}) {
  if (!l.vertices.length || !polygon.vertices.length) {
    return [l];
  }

  const intersections = lineIntersectsLine(l, polygon, {
    sort: true,
    hashA: lineHash,
    hashB: polygonHash,
  });

  if (!intersections.length) {
    if (polygonContainsPoint(polygon, l.vertices[0], { polygonHash })) {
      // Entire line is inside the polygon
      return [];
    }
    // Entire line is outside the polygon
    return [l];
  }

  let inside = polygonContainsPoint(polygon, l.vertices[0], { polygonHash });
  let start = l.vertices[0];
  let segmentIndex = 0;
  const new_lines = [];
  for (let i = 0; i < intersections.length; i++) {
    const intersection = intersections[i];
    if (!inside) {
      const new_line = line(
        start,
        ...l.vertices.slice(segmentIndex + 1, intersection.segmentIndexA + 1),
        intersection.vertex
      );
      new_lines.push(new_line);
    } else {
      start = intersection.vertex;
      segmentIndex = intersection.segmentIndexA;
    }

    inside = !inside;
  }

  if (!inside) {
    // The last intersection took us outside the polygon, so the line must end
    // outside
    const new_line = line(start, ...l.vertices.slice(segmentIndex + 1));
    new_lines.push(new_line);
  }

  return new_lines;
}
