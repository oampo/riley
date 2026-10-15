import { getConfig } from "../config";

export function floatEq(
  a: number,
  b: number,
  {
    epsilon = getConfig().epsilon,
    threshold = getConfig().absoluteComparisonThreshold,
  } = {},
): boolean {
  if (a === b) return true;

  const diff = Math.abs(a - b);
  const norm = Math.min(Math.abs(a + b), Number.MAX_VALUE);
  return diff < Math.max(threshold, epsilon * norm);
}
