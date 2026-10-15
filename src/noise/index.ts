import { perlinSeed } from "./perlin";

export { perlin } from "./perlin";

export function noiseSeed(): void {
  perlinSeed();
}
