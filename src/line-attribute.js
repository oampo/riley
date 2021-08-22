export function weight(lines, weight) {
  if (!Array.isArray(lines)) {
    lines = [lines];
  }

  if (!weight) {
    return lines[0].weight;
  }

  for (const line of lines) {
    line.weight = weight;
  }
}

export function layer(lines, layer) {
  if (!Array.isArray(lines)) {
    lines = [lines];
  }

  if (!layer) {
    return lines[0].layer;
  }

  for (const line of lines) {
    line.layer = layer;
  }
}
