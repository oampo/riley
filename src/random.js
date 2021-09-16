import seedrandom from "seedrandom";

let rng;

export function randomSeed(seed) {
  rng = new seedrandom(seed);
}

export function random(low = 0, high = 1) {
  if (!rng) {
    throw new Error("RNG must be seeded before using random functions");
  }
  return low + rng() * (high - low);
}
