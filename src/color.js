export function color(line, color) {
  if (!color) {
    return line.color;
  }

  line.color = color;
}
