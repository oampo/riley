import * as clipper from "clipper2-ts";

import { vertices } from "./attribute";
import type { Line } from "./line";
import { vec2 } from "./math";

function wrapClipper(
  fn: (
    subject: clipper.Paths64,
    clip: clipper.Paths64,
    fillRule: clipper.FillRule,
  ) => clipper.Paths64,
): (lineA: Line, lineB: Line) => Line[] {
  return (lineA, lineB) => {
    const result = fn(
      [vertices(lineA)],
      [vertices(lineB)],
      clipper.FillRule.NonZero,
    );
    return result.map((p) =>
      vertices(
        lineA,
        p.map(({ x, y }) => vec2(x, y)),
      ),
    );
  };
}

export const intersection = wrapClipper(clipper.intersect);
export const union = wrapClipper(clipper.union);
export const diff = wrapClipper(clipper.difference);
export const xor = wrapClipper(clipper.xor);
