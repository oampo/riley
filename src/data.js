import Vec4 from "./vec4";
export function hex(x) {
  if (x instanceof Vec4) {
    // Color
    return (
      (x.r * 255).toString(16).padStart(2, 0) +
      (x.g * 255).toString(16).padStart(2, 0) +
      (x.b * 255).toString(16).padStart(2, 0) +
      (x.a * 255).toString(16).padStart(2, 0)
    );
  }
  throw new Error(`Could not convert value to hex: ${x}`);
}
