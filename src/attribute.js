export function weight(line, weight) {
  if (!weight) {
    return line.weight;
  }

  line.weight = weight;
}

export function layer(line, layer) {
  if (!line) {
    return line.layer;
  }

  line.layer = layer;
}
