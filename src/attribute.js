export function vertices(line, vertices) {
  if (!vertices) {
    return line.vertices;
  }

  line.vertices = vertices;
}

export function weight(line, weight) {
  if (!weight) {
    return line.weight;
  }

  line.weight = weight;
}

export function layer(line, layer) {
  if (!layer) {
    return line.layer;
  }

  line.layer = layer;
}

export function mapVertices(line, fn) {
  line.vertices = line.vertices.map(fn);
  return line;
}
