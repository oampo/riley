import { UnreachableError } from "./base";
import type { Vec2 } from "./math";
import { vec2 } from "./math";

export type RasterMethod = "amanatidesWoo" | "bresenham";

interface RasterOptions {
  gridSize?: Vec2;
  method?: RasterMethod;
}

export function rasterSegment(
  start: Vec2,
  end: Vec2,
  { gridSize = vec2(1, 1), method = "amanatidesWoo" }: RasterOptions = {},
): Vec2[] {
  switch (method) {
    case "amanatidesWoo":
      return rasterSegmentAmanatidesWoo(start, end, { gridSize });
    case "bresenham":
      return rasterSegmentBresenham(start, end, { gridSize });
    default:
      throw new UnreachableError(method);
  }
}

function rasterSegmentAmanatidesWoo(
  start: Vec2,
  end: Vec2,
  { gridSize = vec2(1, 1) }: Omit<RasterOptions, "method"> = {},
): Vec2[] {
  start = start.div(gridSize);
  end = end.div(gridSize);
  let cell = start.floor();
  const cells = [cell];
  const endCell = end.floor();

  const step = vec2(start.x <= end.x ? 1 : -1, start.y <= end.y ? 1 : -1);
  const border = cell.add(vec2(step.x === 1 ? 1 : 0, step.y === 1 ? 1 : 0));
  const direction = end.sub(start).normalize();
  let tMax = border.sub(start).div(direction);
  const tDelta = vec2(1, 1).div(direction.abs());

  let count = 0;

  while (!cell.eq(endCell) && count < 100) {
    count++;
    if (tMax.x < tMax.y) {
      tMax = tMax.withX(tMax.x + tDelta.x);
      cell = cell.withX(cell.x + step.x);
    } else {
      tMax = tMax.withY(tMax.y + tDelta.y);
      cell = cell.withY(cell.y + step.y);
    }
    cells.push(cell);
  }
  return cells;
}

function rasterSegmentBresenham(
  start: Vec2,
  end: Vec2,
  { gridSize = vec2(1, 1) }: Omit<RasterOptions, "method"> = {},
): Vec2[] {
  start = start.div(gridSize).floor();
  end = end.div(gridSize).floor();

  const diff = vec2(Math.abs(end.x - start.x), -Math.abs(end.y - start.y));
  const direction = vec2(start.x < end.x ? 1 : -1, start.y < end.y ? 1 : -1);

  let error = diff.x + diff.y;

  let cell = start;
  const cells = [cell];
  while (!cell.eq(end)) {
    const error2 = 2 * error;
    if (error2 >= diff.y) {
      error += diff.y;
      cell = cell.withX(cell.x + direction.x);
    }

    if (error2 <= diff.x) {
      error += diff.x;
      cell = cell.withY(cell.y + direction.y);
    }

    cells.push(cell);
  }

  return cells;
}
