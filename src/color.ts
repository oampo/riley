import Line from "./line";
import { Vec4 } from "./math";

export function color(line: Line): Vec4;
export function color(line: Line, color: Vec4): Line;
export function color(line: Line, color?: Vec4): Vec4 | Line {
  if (!color) {
    return line.color;
  }

  line.color = color;
  return line;
}

export function red(line: Line): number;
export function red(line: Line, value: number): Line;
export function red(line: Line, value?: number): number | Line {
  if (!value) {
    return line.color.r;
  }

  line.color.r = value;
  return line;
}

export function green(line: Line): number;
export function green(line: Line, value: number): Line;
export function green(line: Line, value?: number): number | Line {
  if (!value) {
    return line.color.g;
  }

  line.color.g = value;
  return line;
}

export function blue(line: Line): number;
export function blue(line: Line, value: number): Line;
export function blue(line: Line, value?: number) {
  if (!value) {
    return line.color.b;
  }

  line.color.b = value;
  return line;
}

export function alpha(line: Line): number;
export function alpha(line: Line, value: number): Line;
export function alpha(line: Line, value?: number) {
  if (!value) {
    return line.color.a;
  }

  line.color.a = value;
  return line;
}
