import { vec2 } from "./math";
import { vertices } from "./attribute";
import { rasterSegment } from "./raster";

export function hashPoint(v, { gridSize = vec2(10, 10) } = {}) {
  const hashed = v.div(gridSize).floor();
  return `${hashed.x.toFixed()},${hashed.y.toFixed()}`;
}

export class SpatialHash {
  constructor({ gridSize = vec2(10, 10) } = {}) {
    Object.defineProperty(this, "gridSize", {
      value: gridSize,
      enumerable: false,
    });
  }

  addPoint(v, value) {
    const hash = hashPoint(v, { gridSize: this.gridSize });
    if (!(hash in this)) {
      this[hash] = [value];
    } else {
      this[hash].push(value);
    }
  }

  addRasteredSegment(start, end, value, { method = "amanatidesWoo" } = {}) {
    const cells = rasterSegment(start, end, {
      gridSize: this.gridSize,
      method,
    });

    for (const cell of cells) {
      const hash = `${cell.x.toFixed()},${cell.y.toFixed()}`;
      if (!(hash in this)) {
        this[hash] = [value];
      } else {
        this[hash].push(value);
      }
    }
  }
}

export function spatialHash(options) {
  return new SpatialHash(options);
}

export function spatialHashPoints(l, options) {
  const vs = vertices(l);
  const sh = spatialHash(options);
  for (const [i, v] of vs.entries()) {
    sh.addPoint(v, i);
  }
  return sh;
}

export function spatialHashRastered(l, options) {
  const vs = vertices(l);
  const sh = spatialHash(options);
  for (let i = 0; i < vs.length - 1; i++) {
    const start = vs[i];
    const end = vs[i + 1];
    sh.addRasteredSegment(start, end, i);
  }
  return sh;
}
