import { perlinSeed } from "./perlin";

export { default as perlin } from "./perlin";

export function noiseSeed(seed) {
  perlinSeed(seed);
}
