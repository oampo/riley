import type { Line } from "./line";
import { vec2, Vec2 } from "./math";
import { vertices } from "./attribute";
import { rasterSegment, RasterMethod } from "./raster";

interface SpatialHashOptions {
  gridSize: Vec2;
}

export function hashPoint(v: Vec2, { gridSize = vec2(10, 10) } = {}): string {
  const hashed = v.div(gridSize).floor();
  return `${hashed.x.toFixed()},${hashed.y.toFixed()}`;
}

export class SpatialHash<T> {
  gridSize: Vec2;
  entryMap: { [hash: string]: [T] };

  constructor({ gridSize = vec2(10, 10) }: Partial<SpatialHashOptions> = {}) {
    this.gridSize = gridSize;
    this.entryMap = {};
  }

  addPoint(v: Vec2, value: T) {
    const hash = hashPoint(v, { gridSize: this.gridSize });
    if (!(hash in this.entryMap)) {
      this.entryMap[hash] = [value];
    } else {
      this.entryMap[hash].push(value);
    }
  }

  entries() {
    return Object.entries(this.entryMap);
  }

  getByHash(hash: string): T[] {
    return this.entryMap[hash];
  }

  addRasteredSegment(
    start: Vec2,
    end: Vec2,
    value: T,
    { method = "amanatidesWoo" }: { method?: RasterMethod } = {}
  ) {
    const cells = rasterSegment(start, end, {
      gridSize: this.gridSize,
      method,
    });

    for (const cell of cells) {
      const hash = `${cell.x.toFixed()},${cell.y.toFixed()}`;
      if (!(hash in this.entryMap)) {
        this.entryMap[hash] = [value];
      } else {
        this.entryMap[hash].push(value);
      }
    }
  }

  search(center: Vec2, size: Vec2) {
    center = center.div(this.gridSize);
    size = size.div(this.gridSize);
    const topLeft = center.sub(size.scale(0.5)).floor();
    const bottomRight = center.add(size.scale(0.5)).ceil();

    const result = [];
    for (let x = topLeft.x; x < bottomRight.x; x++) {
      for (let y = topLeft.y; y < bottomRight.y; y++) {
        const hash = `${x.toFixed()},${y.toFixed()}`;
        if (hash in this.entryMap) {
          result.push(...this.entryMap[hash]);
        }
      }
    }
    return result;
  }
}

export function spatialHash<T>(
  options: Partial<SpatialHashOptions>
): SpatialHash<T> {
  return new SpatialHash<T>(options);
}

export function spatialHashPoints(
  l: Line,
  options: Partial<SpatialHashOptions>
): SpatialHash<number> {
  const vs = vertices(l);
  const sh: SpatialHash<number> = spatialHash(options);
  for (const [i, v] of vs.entries()) {
    sh.addPoint(v, i);
  }
  return sh;
}

export function spatialHashRastered(
  l: Line,
  options: Partial<SpatialHashOptions>
): SpatialHash<number> {
  const vs = vertices(l);
  const sh: SpatialHash<number> = spatialHash(options);
  for (let i = 0; i < vs.length - 1; i++) {
    const start = vs[i];
    const end = vs[i + 1];
    sh.addRasteredSegment(start, end, i);
  }
  return sh;
}
