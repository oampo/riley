import { getConfig } from "../config";

export function floatEq(
  a: number,
  b: number,
  { epsilon = getConfig().epsilon } = {},
): boolean {
  if (a === b) return true;

  const diff = Math.abs(a - b);
  return diff <= epsilon;
}

export function floatLte(
  a: number,
  b: number,
  { epsilon = getConfig().epsilon } = {},
): boolean {
  return a <= b + epsilon;
}

export function floatGte(
  a: number,
  b: number,
  { epsilon = getConfig().epsilon } = {},
): boolean {
  return a >= b - epsilon;
}
