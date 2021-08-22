export function color(lines, color) {
  if (!Array.isArray(lines)) {
    lines = [lines];
  }

  if (!color) {
    return lines[0].color;
  }

  for (const line of lines) {
    line.color = color;
  }
}
