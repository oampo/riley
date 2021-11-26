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

export function randomInt(low = 0, high = 2) {
  return Math.floor(random(low, high));
}

export function gaussian(mean = 0, variance = 1) {
  const r1 = random();
  const r2 = random();

  // Gaussian centered around 0, with variance of 1
  const gaussian01 = Math.sqrt(-2 * Math.log(r1)) * Math.sin(2 * Math.PI * r2);
  return mean + variance * gaussian01;
}
