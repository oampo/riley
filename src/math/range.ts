export function remap(
  value: number,
  fromStart: number,
  fromStop: number,
  toStart: number,
  toStop: number,
): number {
  const fromRange = fromStop - fromStart;
  const toRange = toStop - toStart;
  return toStart + (toRange * (value - fromStart)) / fromRange;
}

export function clamp(a: number, min: number, max: number): number {
  if (a < min) {
    return min;
  } else if (a > max) {
    return max;
  }
  return a;
}
