import { smootherstep } from "../math";
import { random } from "../random";
import Vec2 from "../vec2";
import Vec3 from "../vec3";
import Vec4 from "../vec4";
import perlin1d from "./perlin1d";
import perlin2d from "./perlin2d";
import perlin3d from "./perlin3d";
import perlin4d from "./perlin4d";

export const PERLIN_TABLE_SIZE = 512;
export const PERLIN_TABLE_HALF_SIZE = PERLIN_TABLE_SIZE / 2;

export let perlinTable;

export function perlinSeed() {
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

export default function perlin(value, options = {}) {
  options = {
    octaves: 4,
    decay: 0.5,
    lacunarity: 2,
    interpolate: smootherstep,
    ...options,
  };
  if (typeof value === "number") {
    return perlin1d(value, options);
  } else if (value instanceof Vec2) {
    return perlin2d(value, options);
  } else if (value instanceof Vec3) {
    return perlin3d(value, options);
  } else if (value instanceof Vec4) {
    return perlin4d(value, options);
  }

  throw new Error(`Could not get perlin noise for value: ${value}`);
}
