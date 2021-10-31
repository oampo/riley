export function color(line, color) {
  if (!color) {
    return line.color;
  }

  line.color = color;
  return line;
}

export function red(line, value) {
  if (!value) {
    return line.color.r;
  }

  line.color.r = value;
  return line;
}

export function green(line, value) {
  if (!value) {
    return line.color.g;
  }

  line.color.g = value;
  return line;
}

export function blue(line, value) {
  if (!value) {
    return line.color.b;
  }

  line.color.b = value;
  return line;
}

export function alpha(line, value) {
  if (!value) {
    return line.color.a;
  }

  line.color.a = value;
  return line;
}
