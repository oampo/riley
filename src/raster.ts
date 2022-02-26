import { vec2, Vec2 } from "./math";

export type RasterMethod = "amanatidesWoo" | "bresenham";

interface RasterOptions {
  gridSize?: Vec2;
  method?: RasterMethod;
}

export function rasterSegment(
  start: Vec2,
  end: Vec2,
  { gridSize = vec2(1, 1), method = "amanatidesWoo" }: RasterOptions = {}
) {
  if (method === "amanatidesWoo") {
    return rasterSegmentAmanatidesWoo(start, end, { gridSize });
  } else if (method === "bresenham") {
    return rasterSegmentBresenham(start, end, { gridSize });
  } else {
    throw new Error(`Unknown method: ${method}`);
  }
}

function rasterSegmentAmanatidesWoo(
  start: Vec2,
  end: Vec2,
  { gridSize = vec2(1, 1) }: Omit<RasterOptions, "method"> = {}
) {
  start = start.div(gridSize);
  end = end.div(gridSize);
  const cell = start.floor();
  const cells = [cell.clone()];
  const endCell = end.floor();

  const step = vec2(start.x <= end.x ? 1 : -1, start.y <= end.y ? 1 : -1);
  const border = cell.add(vec2(step.x === 1 ? 1 : 0, step.y === 1 ? 1 : 0));
  const direction = end.sub(start).normalize();
  const tMax = border.sub(start).div(direction);
  const tDelta = vec2(1, 1).div(direction.abs());

  let count = 0;

  while (!cell.equals(endCell) && count < 100) {
    count++;
    if (tMax.x < tMax.y) {
      tMax.x += tDelta.x;
      cell.x += step.x;
    } else {
      tMax.y += tDelta.y;
      cell.y += step.y;
    }
    cells.push(cell.clone());
  }
  return cells;
}

function rasterSegmentBresenham(
  start: Vec2,
  end: Vec2,
  { gridSize = vec2(1, 1) }: Omit<RasterOptions, "method"> = {}
) {
  start = start.div(gridSize).floor();
  end = end.div(gridSize).floor();

  const diff = vec2(Math.abs(end.x - start.x), -Math.abs(end.y - start.y));
  const direction = vec2(start.x < end.x ? 1 : -1, start.y < end.y ? 1 : -1);

  let error = diff.x + diff.y;

  const cell = start.clone();
  const cells = [cell.clone()];
  while (!cell.equals(end)) {
    const error2 = 2 * error;
    if (error2 >= diff.y) {
      error += diff.y;
      cell.x += direction.x;
    }

    if (error2 <= diff.x) {
      error += diff.x;
      cell.y += direction.y;
    }

    cells.push(cell.clone());
  }

  return cells;
}
