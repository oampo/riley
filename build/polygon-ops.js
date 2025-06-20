import * as martinez from "martinez-polygon-clipping";
import { vec2 } from "./math";
function lineToPolygon(l) {
    const { vertices } = l;
    return [vertices.map((vertex) => [vertex.x, vertex.y])];
}
function wrapMartinez(martinezFn) {
    return function (polygonA, polygonB) {
        const result = martinezFn(lineToPolygon(polygonA), lineToPolygon(polygonB));
        return result.map((x) => {
            if (!x.length) {
                return {
                    ...polygonA,
                    vertices: [],
                };
            }
            return {
                ...polygonA,
                vertices: x[0].map((vertex) => {
                    if (!Array.isArray(vertex))
                        throw new Error("Expected array");
                    return vec2(vertex[0], vertex[1]);
                }),
            };
        });
    };
}
export const intersection = wrapMartinez(martinez.intersection);
export const union = wrapMartinez(martinez.union);
export const diff = wrapMartinez(martinez.diff);
export const xor = wrapMartinez(martinez.xor);
