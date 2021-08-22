export function hex(x) {
  if (x instanceof Float32Array && x.length === 4) {
    // Color
    return (
      (x[0] * 255).toString(16).padStart(2, 0) +
      (x[1] * 255).toString(16).padStart(2, 0) +
      (x[2] * 255).toString(16).padStart(2, 0) +
      (x[3] * 255).toString(16).padStart(2, 0)
    );
  }
  throw new Error(`Could not convert value to hex: ${x}`);
}
