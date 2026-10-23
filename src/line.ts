import type { RgbaColor } from "./color";
import { alpha, blue, green, red, rgba } from "./color";
import { getConfig } from "./config";
import type { Vec2 } from "./math";
import { vec2 } from "./math";

export interface Line {
  readonly vertices: Vec2[];
  readonly color: RgbaColor;
  readonly weight: number;
  readonly layer: number;
}

export function line(...vertices: Vec2[]): Line {
  return {
    vertices,
    color: getConfig().defaultColor,
    weight: getConfig().defaultWeight,
    layer: 0,
  };
}

type SerializedLine = {
  vertices: [number, number][];
  color: [number, number, number, number];
  weight: number;
  layer: number;
};

export function serialize(lines: Line[]): string {
  return JSON.stringify(
    lines.map((l) => ({
      vertices: l.vertices.map((l) => [l.x, l.y]),
      color: [red(l), green(l), blue(l), alpha(l)],
      weight: l.weight,
      layer: l.layer,
    })),
  );
}

export function deserialize(s: string): Line[] {
  const parsed = JSON.parse(s) as SerializedLine[];
  return parsed.map((l: SerializedLine) => ({
    vertices: l.vertices.map(([x, y]) => vec2(x, y)),
    color: rgba(l.color[0], l.color[1], l.color[2], l.color[3]),
    weight: l.weight,
    layer: l.layer,
  }));
}
