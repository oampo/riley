import { getConfig } from "./config";
import type { Vec2 } from "./math";
import { vec2 } from "./math";

export interface Line {
  readonly vertices: Vec2[];
  readonly layer: number;
  readonly pen: number;
  readonly color: number;
}

export function line(...vertices: Vec2[]): Line {
  const config = getConfig();
  return {
    vertices,
    pen: config.defaultPen,
    color: config.defaultColor,
    layer: 0,
  };
}

type SerializedLine = {
  vertices: [number, number][];
  pen: number;
  color: number;
  layer: number;
};

export function serialize(lines: Line[]): string {
  const serialized: SerializedLine[] = lines.map((l) => ({
    vertices: l.vertices.map((l) => [l.x, l.y]),
    color: l.color,
    layer: l.layer,
    pen: l.pen,
  }));

  return JSON.stringify(serialized);
}

export function deserialize(s: string): Line[] {
  const parsed = JSON.parse(s) as SerializedLine[];
  return parsed.map((l: SerializedLine) => ({
    vertices: l.vertices.map(([x, y]) => vec2(x, y)),
    pen: l.pen,
    color: l.color,
    layer: l.layer,
  }));
}
