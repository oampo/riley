import seedrandom from "seedrandom";

interface prng {
  (): number;
  double(): number;
  int32(): number;
  quick(): number;
  state: seedrandom.State;
}

let rng: prng;

export function randomSeed(seed: number | string) {
  const seedString = typeof seed === "number" ? seed.toString() : seed;
  rng = seedrandom(seedString);
}

export function random(low = 0, high = 1): number {
  if (!rng) {
    throw new Error("RNG must be seeded before using random functions");
  }
  return low + rng() * (high - low);
}

export function randomInt(low = 0, high = 2): number {
  return Math.floor(random(low, high));
}

export function gaussian(mean = 0, variance = 1): number {
  const r1 = random();
  const r2 = random();

  // Gaussian centered around 0, with variance of 1
  const gaussian01 = Math.sqrt(-2 * Math.log(r1)) * Math.sin(2 * Math.PI * r2);
  return mean + variance * gaussian01;
}
