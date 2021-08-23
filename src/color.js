export function color(group, color) {
  if (!color) {
    return group.color;
  }

  group.color = color;
}
