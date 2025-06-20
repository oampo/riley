import { vec2 } from "./math";
import { vertices } from "./attribute";
import { rasterSegment } from "./raster";
export function hashPoint(v, { gridSize = vec2(10, 10) } = {}) {
    const hashed = v.div(gridSize).floor();
    return `${hashed.x.toFixed()},${hashed.y.toFixed()}`;
}
export class SpatialHash {
    constructor({ gridSize = vec2(10, 10) } = {}) {
        this.gridSize = gridSize;
        this.entryMap = {};
    }
    addPoint(v, value) {
        const hash = hashPoint(v, { gridSize: this.gridSize });
        if (!(hash in this.entryMap)) {
            this.entryMap[hash] = [value];
        }
        else {
            this.entryMap[hash].push(value);
        }
    }
    entries() {
        return Object.entries(this.entryMap);
    }
    getByHash(hash) {
        return this.entryMap[hash];
    }
    addRasteredSegment(start, end, value, { method = "amanatidesWoo" } = {}) {
        const cells = rasterSegment(start, end, {
            gridSize: this.gridSize,
            method,
        });
        for (const cell of cells) {
            const hash = `${cell.x.toFixed()},${cell.y.toFixed()}`;
            if (!(hash in this.entryMap)) {
                this.entryMap[hash] = [value];
            }
            else {
                this.entryMap[hash].push(value);
            }
        }
    }
    search(center, size) {
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
