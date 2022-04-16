import type { FirstOrderInterpolationFn } from "../math";

import { smootherstep } from "../math";
import { random } from "../random";
import { Vec2, Vec3, Vec4 } from "../math";
import perlin1d from "./perlin1d";
import perlin2d from "./perlin2d";
import perlin3d from "./perlin3d";
import perlin4d from "./perlin4d";

export const PERLIN_TABLE_SIZE = 512;
export const PERLIN_TABLE_HALF_SIZE = PERLIN_TABLE_SIZE / 2;

interface PerlinOptions {
  octaves?: number;
  decay?: number;
  lacunarity?: number;
  interpolate?: FirstOrderInterpolationFn;
}

export let perlinTable: number[];

export function perlinSeed(): void {
  perlinTable = new Array(PERLIN_TABLE_SIZE);
  const PERLIN_TABLE_HALF_SIZE = PERLIN_TABLE_SIZE / 2;
  // Fill the table with the values 0-i
  for (let i = 0; i < PERLIN_TABLE_HALF_SIZE; i++) {
    perlinTable[i] = i;
  }
  // Shuffle the values
  for (let i = 0; i < PERLIN_TABLE_HALF_SIZE; i++) {
    const randomIndex = Math.floor(random(0, PERLIN_TABLE_HALF_SIZE));
    const temp = perlinTable[i];
    perlinTable[i] = perlinTable[randomIndex];
    perlinTable[randomIndex] = temp;
  }

  // Duplicate the first half of the table in the second half
  for (let i = 0; i < PERLIN_TABLE_HALF_SIZE; i++) {
    perlinTable[i + PERLIN_TABLE_HALF_SIZE] = perlinTable[i];
  }
}

export default function perlin(
  value: number | Vec2 | Vec3 | Vec4,
  options: PerlinOptions = {}
) {
  const optionsWithDefaults: Required<PerlinOptions> = {
    octaves: 4,
    decay: 0.5,
    lacunarity: 2,
    interpolate: smootherstep,
    ...options,
  };
  if (typeof value === "number") {
    return perlin1d(value, optionsWithDefaults);
  } else if (value instanceof Vec2) {
    return perlin2d(value, optionsWithDefaults);
  } else if (value instanceof Vec3) {
    return perlin3d(value, optionsWithDefaults);
  } else if (value instanceof Vec4) {
    return perlin4d(value, optionsWithDefaults);
  }

  throw new Error(`Could not get perlin noise for value: ${value}`);
}
