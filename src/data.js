import Vec4 from "./vec4";

export function hex(x) {
  if (!(x instanceof Vec4)) {
    throw new Error(`Could not convert value to hex: ${x}`);
  }

  return (
    Math.floor(x.r * 255)
      .toString(16)
      .padStart(2, 0) +
    Math.floor(x.g * 255)
      .toString(16)
      .padStart(2, 0) +
    Math.floor(x.b * 255)
      .toString(16)
      .padStart(2, 0) +
    Math.floor(x.a * 255)
      .toString(16)
      .padStart(2, 0)
  );
}
