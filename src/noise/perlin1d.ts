import { lerp, remap, FirstOrderInterpolationFn } from "../math";
import { perlinTable, PERLIN_TABLE_HALF_SIZE } from "./perlin";
import { sumOctaves } from "./util";

const PERLIN_GRADIENTS_1D = [1, -1];
const PERLIN_CORNERS_1D = [0, 1];

function perlinGradient1d(index: number): number {
  return PERLIN_GRADIENTS_1D[perlinTable[index] % PERLIN_GRADIENTS_1D.length];
}

export default sumOctaves(
  (
    value: number,
    { interpolate }: { interpolate: FirstOrderInterpolationFn }
  ) => {
    // Wrap negative values
    value = value < 0 ? Number.MAX_SAFE_INTEGER + value : value;
    const gridIndex = Math.floor(value);
    const gridPoint = value - gridIndex;
    const modIndex = gridIndex % PERLIN_TABLE_HALF_SIZE;

    // Find the gradient at the corners
    const gradient0 = perlinGradient1d(modIndex + PERLIN_CORNERS_1D[0]);
    const gradient1 = perlinGradient1d(modIndex + PERLIN_CORNERS_1D[1]);

    // Create vectors from the corners to the point inside the grid cell
    const v0 = gridPoint - PERLIN_CORNERS_1D[0];
    const v1 = gridPoint - PERLIN_CORNERS_1D[1];

    // Work out the dot product of the gradient and the vectors
    const dot0 = gradient0 * v0;
    const dot1 = gradient1 * v1;

    const result = lerp(dot0, dot1, interpolate(0, 1, gridPoint));

    return remap(result, -1, 1, 0, 1);
  }
);
