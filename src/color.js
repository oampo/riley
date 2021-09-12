export function color(line, color) {
  if (!color) {
    return line.color;
  }

  line.color = color;
}

export function red(line, value) {
  if (!value) {
    return line.color.r;
  }

  line.color.r = value;
}

export function green(line, value) {
  if (!value) {
    return line.color.g;
  }

  line.color.g = value;
}

export function blue(line, value) {
  if (!value) {
    return line.color.b;
  }

  line.color.b = value;
}

export function alpha(line, value) {
  if (!value) {
    return line.color.a;
  }

  line.color.a = value;
}
