import type { Vec2, Vec3, Vec4 } from "../math";

type NoiseInputValue = number | Vec2 | Vec3 | Vec4;

type NoiseFn<InputValue, Options> = (
  value: InputValue,
  options: Options
) => number;

interface OctaveNoiseOptions {
  octaves?: number;
  decay?: number;
  lacunarity?: number;
}

export function sumOctaves<InputValue extends NoiseInputValue, NoiseFnOptions>(
  fn: NoiseFn<InputValue, NoiseFnOptions>
) {
  return function (
    value: InputValue,
    options: OctaveNoiseOptions & NoiseFnOptions
  ) {
    const { octaves = 4, decay = 0.5, lacunarity = 2, ...rest } = options;
    let frequency = 1;
    let amplitude = 1;
    let sum = 0;
    for (let i = 0; i < octaves; i++) {
      const scaledValue =
        typeof value === "number" ? value * frequency : value.scale(frequency);
      sum += fn(scaledValue as InputValue, rest as NoiseFnOptions) * amplitude;
      frequency *= lacunarity;
      amplitude *= decay;
    }

    // Sum of power sequence decay^0 + decay^1 + decay^2...
    const maxValue = (decay ** octaves - 1) / (decay - 1);
    return sum / maxValue;
  };
}
