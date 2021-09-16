export function sumOctaves(fn) {
  return function (value, options) {
    const { octaves = 4, decay = 0.5, lacunarity = 2, ...rest } = options;
    let frequency = 1;
    let amplitude = 1;
    let sum = 0;
    for (let i = 0; i < octaves; i++) {
      const scaledValue =
        typeof value === "number" ? value * frequency : value.scale(frequency);
      sum += fn(scaledValue, rest) * amplitude;
      frequency *= lacunarity;
      amplitude *= decay;
    }

    // Sum of power sequence decay^0 + decay^1 + decay^2...
    const maxValue = (decay ** octaves - 1) / (decay - 1);
    return sum / maxValue;
  };
}
