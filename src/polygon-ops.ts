import * as martinez from "martinez-polygon-clipping";

import { vec2 } from "./math";

function wrapMartinez(martinezFn) {
  return function (...polygons) {
    if (polygons.length <= 1) {
      return polygons;
    }

    const result = martinezFn(
      ...polygons.map((line) => {
        const { vertices } = line;
        return [vertices.map((vertex) => [vertex.x, vertex.y])];
      })
    );

    return result.map((x) => ({
      ...polygons[0],
      vertices: x[0].map((vertex) => vec2(vertex[0], vertex[1])),
    }));
  };
}

export const intersection = wrapMartinez(martinez.intersection);
export const union = wrapMartinez(martinez.union);
export const diff = wrapMartinez(martinez.diff);
export const xor = wrapMartinez(martinez.xor);
