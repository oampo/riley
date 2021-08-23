import { vec2 } from "gl-matrix";
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

export function circle(center, radius, resolution = config.defaultResolution) {
  const circumference = 2 * Math.PI * radius;
  const numVertices = circumference / resolution;
  const segmentAngle = (2 * Math.PI) / numVertices;

  const vertices = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = i * segmentAngle;
    const vertex = vec2.fromValues(
      center[0] + radius * Math.sin(angle),
      center[1] + radius * Math.cos(angle)
    );
    vertices.push(vertex);
  }
  vertices.push(vec2.clone(vertices[0]));
  return line(...vertices);
}
