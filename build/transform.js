import { vec2 } from "./math";
export function translate(line, translation) {
    return {
        ...line,
        vertices: line.vertices.map((v) => v.add(translation)),
    };
}
export function scale(line, scale) {
    return {
        ...line,
        vertices: line.vertices.map((v) => v.mul(scale)),
    };
}
export function rotate(line, rotation, { center = vec2() } = {}) {
    return {
        ...line,
        vertices: line.vertices.map((v) => v.rotate(center, rotation)),
    };
}
export function transform(line, transform) {
    return {
        ...line,
        vertices: line.vertices.map((v) => v.transformMat3(transform)),
    };
}
