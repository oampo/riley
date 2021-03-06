import config from "./config";
import { boundingBox } from "./geometry";
import type { Line } from "./line";
import { Vec2, vec2 } from "./math";
import { line } from "./line";
import { SpatialHash } from "./spatial-hash";
import { rotate, translate } from "./transform";
import { clip } from "./clip-mask";

type HatchSpacing =
  | number
  | Array<number>
  | ((i: number, x: number, squareSize: number) => number);

type SpacingFn = (i: number, width: number, squareSize: number) => number;

function getSpacingFn(spacing: HatchSpacing): SpacingFn {
  if (typeof spacing === "number") {
    return () => spacing;
  } else if (Array.isArray(spacing)) {
    return (i: number) => spacing[i % spacing.length];
  } else if (typeof spacing === "function") {
    return spacing;
  } else {
    throw new Error("Unknown spacing type");
  }
}

interface HatchOptions {
  angle?: number;
  spacing?: HatchSpacing;
  render?: (start: Vec2, end: Vec2) => Line;
  alternate?: boolean;
  polygonHash?: SpatialHash<number>;
}

export function hatch(
  polygon: Line,
  {
    angle = 0,
    spacing = config.defaultWeight * 2,
    render = (start, end) => line(start, end),
    alternate = true,
    polygonHash,
  }: HatchOptions = {}
) {
  // Approach: render a hatched square the size of the bounding box diagonal,
  // then clip the box to the polygon
  const { size, center } = boundingBox(polygon);
  const squareSize = size.len();
  const spacingFn = getSpacingFn(spacing);

  const lines = [];
  let width = 0;
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const start = vec2(width, 0);
    const end = vec2(width, squareSize);
    let l;
    if (!alternate || i % 2 === 0) {
      l = render(start, end);
    } else {
      l = render(end, start);
    }
    lines.push(l);

    const spacing = spacingFn(i, width, squareSize);
    if (width + spacing > squareSize) {
      break;
    }

    width += spacing;
    i++;
  }

  const clipped = lines.flatMap((l) => {
    translate(l, vec2(-width / 2, -squareSize / 2));
    rotate(l, angle);
    translate(l, center);
    return clip(l, polygon, { polygonHash });
  });

  return clipped;
}
