let seed: number | undefined;

function hash(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

export function randomSeed(s: number | string) {
  seed = typeof s === "string" ? hash(s) : s;
}

export function random(low = 0, high = 1): number {
  if (!seed) {
    throw new Error("RNG must be seeded before using random functions");
  }
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  const random = seed / 0x7fffffff;

  return low + random * (high - low);
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
