export function vertices(line, vertices) {
  if (!vertices) {
    return line.vertices;
  }

  line.vertices = vertices;
  return line;
}

export function weight(line, weight) {
  if (!weight) {
    return line.weight;
  }

  line.weight = weight;
  return line;
}

export function layer(line, layer) {
  if (!layer) {
    return line.layer;
  }

  line.layer = layer;
  return line;
}

export function mapVertices(line, fn) {
  line.vertices = line.vertices.map(fn);
  return line;
}

export function pushVertices(line, ...vertices) {
  line.vertices.push(...vertices);
  return line;
}
