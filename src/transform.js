import { vec2 } from "./math";

export function translate(line, translation) {
  line.vertices = line.vertices.map((v) => v.add(translation));
  return line;
}

export function scale(line, scale) {
  line.vertices = line.vertices.map((v) => v.mul(scale));
  return line;
}

export function rotate(line, rotation, {center=vec2()}={}) {
  line.vertices = line.vertices.map((v) => v.rotate(center, rotation));
  return line;
}

export function transform(line, transform) {
  line.vertices = line.vertices.map((v) => v.transformMat3(transform));
  return line;
}
