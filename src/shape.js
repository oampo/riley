import { vec2, vec3 } from "gl-matrix";
import config from "./config";

export function line(...vertices) {
  return {
    lines: [vertices],
    color: config.defaultColor,
    weight: config.defaultWeight,
    layer: 0,
  };
}

export function rect(center, size) {
  return line(
    vec2.fromValues(center[0] - size[0] / 2, center[1] - size[1] / 2),
    vec2.fromValues(center[0] - size[0] / 2, center[1] + size[1] / 2),
    vec2.fromValues(center[0] + size[0] / 2, center[1] + size[1] / 2),
    vec2.fromValues(center[0] + size[0] / 2, center[1] - size[1] / 2),
    vec2.fromValues(center[0] - size[0] / 2, center[1] - size[1] / 2)
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
    const vertex = vec2.fromValues(
      center[0] + radius * Math.cos(angle),
      center[1] + radius * Math.sin(angle)
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
    const vertex = vec2.fromValues(
      center[0] + radius * Math.cos(angle),
      center[1] + radius * Math.sin(angle)
    );
    vertices.push(vertex);
  }
  return line(...vertices);
}

function ellipseCircumference(size) {
  // Ramanujan approximation for ellipse circumference
  const h = (size[0] - size[1]) / (size[0] + size[1]);
  return (
    Math.PI *
    (size[0] + size[1]) *
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
    const vertex = vec2.fromValues(
      center[0] + size[0] * Math.cos(angle),
      center[1] + size[1] * Math.sin(angle)
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
    const vertex = vec2.fromValues(
      center[0] + size[0] * Math.cos(angle),
      center[1] + size[1] * Math.sin(angle)
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
  const mid12 = vec2.lerp(vec2.create(), p1, p2, 0.5);
  const mid23 = vec2.lerp(vec2.create(), p2, p3, 0.5);
  const mid34 = vec2.lerp(vec2.create(), p3, p4, 0.5);
  const mid14 = vec2.lerp(vec2.create(), p1, p4, 0.5);
  const mid123 = vec2.lerp(vec2.create(), mid12, mid23, 0.5);
  const mid234 = vec2.lerp(vec2.create(), mid23, mid34, 0.5);
  const mid1234 = vec2.lerp(vec2.create(), mid123, mid234, 0.5);

  // Work out whether the points lie in a straight line
  const diff14 = vec2.sub(vec2.create(), p4, p1);
  const diff24 = vec2.sub(vec2.create(), p2, p4);
  const diff34 = vec2.sub(vec2.create(), p3, p4);
  // If the cross-product is of two lines is ~zero, they are collinear
  const cross124 = Math.abs(vec2.cross(vec3.create(), diff14, diff24)[2]);
  const cross134 = Math.abs(vec2.cross(vec3.create(), diff14, diff34)[2]);
  const collinear124 = cross124 < Number.EPSILON;
  const collinear134 = cross134 < Number.EPSILON;

  if (collinear124 && collinear134) {
    // All four points are in a line
    const distance = vec2.sqrDist(mid1234, mid14);
    if (distance <= distanceTolerance) {
      return [p1, mid1234, p4];
    }
  } else {
    // They're not collinear
    if ((cross124 + cross134) ** 2 <= distanceTolerance * vec2.sqrLen(diff14)) {
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
