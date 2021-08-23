export function weight(group, weight) {
  if (!weight) {
    return group.weight;
  }

  group.weight = weight;
}

export function layer(group, layer) {
  if (!group) {
    return group.layer;
  }

  group.layer = layer;
}
