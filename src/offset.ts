import * as clipper from "clipper2-ts";

import { vertices } from "./attribute";
import type { Line } from "./line";
import { vec2 } from "./math";

export function offset(line: Line, delta: number): Line[] {
  const result = clipper.inflatePaths(
    [vertices(line)],
    delta,
    clipper.JoinType.Miter,
    clipper.EndType.Polygon,
  );
  return result.map((p) => {
    const vs = p.map(({ x, y }) => vec2(x, y));
    if (vs.length > 1) {
      vs.push(vs[0]);
    }
    return vertices(line, vs);
  });
}
