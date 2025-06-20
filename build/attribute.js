export function vertices(line, vertices) {
    if (!vertices) {
        return line.vertices;
    }
    return {
        ...line,
        vertices,
    };
}
export function weight(line, weight) {
    if (!weight) {
        return line.weight;
    }
    return {
        ...line,
        weight,
    };
}
export function layer(line, layer) {
    if (!layer) {
        return line.layer;
    }
    return {
        ...line,
        layer,
    };
}
export function mapVertices(line, fn) {
    return {
        ...line,
        vertices: line.vertices.map(fn),
    };
}
export function pushVertices(line, ...vertices) {
    return {
        ...line,
        vertices: [...line.vertices, ...vertices],
    };
}
