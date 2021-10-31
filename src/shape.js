import config from "./config";
import { vec2 } from "./math";

export function line(...vertices) {
  return {
    vertices,
    color: config.defaultColor,
    weight: config.defaultWeight,
    layer: 0,
  };
}

export function rect(center, size) {
  return line(
    vec2(center.x - size.x / 2, center.y - size.y / 2),
    vec2(center.x - size.x / 2, center.y + size.y / 2),
    vec2(center.x + size.x / 2, center.y + size.y / 2),
    vec2(center.x + size.x / 2, center.y - size.y / 2),
    vec2(center.x - size.x / 2, center.y - size.y / 2)
  );
}

export function circle(
  center,
  radius,
  { resolution = config.defaultResolution } = {}
) {
  const circumference = 2 * Math.PI * radius;
  const numVertices = Math.floor(circumference / resolution);
  const segmentAngle = (2 * Math.PI) / numVertices;

  const vertices = [];
  for (let i = 0; i < numVertices + 1; i++) {
    const angle = i * segmentAngle;
    const vertex = vec2(
      center.x + radius * Math.cos(angle),
      center.y + radius * Math.sin(angle)
    );
    vertices.push(vertex);
  }
  return line(...vertices);
}

export function circularArc(
  center,
  radius,
  fromAngle,
  toAngle,
  { resolution = config.defaultResolution } = {}
) {
  const arcLength = (toAngle - fromAngle) * radius;
  const numVertices = Math.floor(arcLength / resolution);
  const segmentAngle = (toAngle - fromAngle) / numVertices;

  const vertices = [];
  for (let i = 0; i < numVertices + 1; i++) {
    const angle = fromAngle + i * segmentAngle - Math.PI / 2;
    const vertex = vec2(
      center.x + radius * Math.cos(angle),
      center.y + radius * Math.sin(angle)
    );
    vertices.push(vertex);
  }
  return line(...vertices);
}

function ellipseCircumference(size) {
  // Ramanujan approximation for ellipse circumference
  const h = (size.x - size.y) / (size.x + size.y);
  return (
    Math.PI *
    (size.x + size.y) *
    (1 + (3 * h ** 2) / (10 + Math.sqrt(4 - 3 * h ** 2)))
  );
}

export function ellipse(
  center,
  size,
  { resolution = config.defaultResolution } = {}
) {
  const circumference = ellipseCircumference(size);
  const numVertices = Math.floor(circumference / resolution);
  const segmentAngle = (2 * Math.PI) / numVertices;

  const vertices = [];
  for (let i = 0; i < numVertices + 1; i++) {
    const angle = i * segmentAngle;
    const vertex = vec2(
      center.x + size.x * Math.cos(angle),
      center.y + size.y * Math.sin(angle)
    );
    vertices.push(vertex);
  }
  return line(...vertices);
}

export function ellipticalArc(
  center,
  size,
  fromAngle,
  toAngle,
  { resolution = config.defaultResolution } = {}
) {
  // Work out the number of vertices and segmetn angle for the entire ellipse
  const circumference = ellipseCircumference(size);
  const numVertices = Math.floor(circumference / resolution);
  const segmentAngle = (2 * Math.PI) / numVertices;

  const arcNumVertices = Math.floor((toAngle - fromAngle) / segmentAngle);
  const arcSegmentAngle = (toAngle - fromAngle) / arcNumVertices;

  const vertices = [];
  for (let i = 0; i < arcNumVertices + 1; i++) {
    const angle = fromAngle + i * arcSegmentAngle - Math.PI / 2;
    const vertex = vec2(
      center.x + size.x * Math.cos(angle),
      center.y + size.y * Math.sin(angle)
    );
    vertices.push(vertex);
  }
  return line(...vertices);
}

function _bezier(
  p1,
  p2,
  p3,
  p4,
  { resolution = config.defaultResolution, recursion = 8 } = {}
) {
  if (recursion < 0) {
    return [];
  }

  const distanceTolerance = resolution ** 2;

  // Calculate the midpoints
  const mid12 = p1.lerp(p2, 0.5);
  const mid23 = p2.lerp(p3, 0.5);
  const mid34 = p3.lerp(p4, 0.5);
  const mid14 = p1.lerp(p4, 0.5);
  const mid123 = mid12.lerp(mid23, 0.5);
  const mid234 = mid23.lerp(mid34, 0.5);
  const mid1234 = mid123.lerp(mid234, 0.5);

  // Work out whether the points lie in a straight line
  const diff14 = p1.sub(p4);
  const diff24 = p2.sub(p4);
  const diff34 = p3.sub(p4);
  // If the cross-product is of two lines is ~zero, they are collinear
  const cross124 = Math.abs(diff14.cross(diff24).z);
  const cross134 = Math.abs(diff14.cross(diff34).z);
  const collinear124 = cross124 < Number.EPSILON;
  const collinear134 = cross134 < Number.EPSILON;

  if (collinear124 && collinear134) {
    // All four points are in a line
    const distance = mid1234.sqrDist(mid14);
    if (distance <= distanceTolerance) {
      return [p1, mid1234, p4];
    }
  } else {
    // They're not collinear
    if ((cross124 + cross134) ** 2 <= distanceTolerance * diff14.sqrLen()) {
      return [p1, mid1234, p4];
    }
  }

  const left = _bezier(p1, mid12, mid123, mid1234, {
    resolution,
    recursion: recursion - 1,
  });
  const right = _bezier(mid1234, mid234, mid34, p4, {
    resolution,
    recursion: recursion - 1,
  });
  // Left and right both contain the mid value (at end and start respectively)
  // Slice if off the right side
  return [...left, ...right.slice(1)];
}

export function bezier(start, c1, c2, end, options) {
  return line(..._bezier(start, c1, c2, end, options));
}
