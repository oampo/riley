import { lerp, remap, vec2 } from "../math";
import { perlinTable, PERLIN_TABLE_HALF_SIZE } from "./perlin";
import { sumOctaves } from "./util";

const PERLIN_GRADIENTS_2D = [
  vec2(1, 0),
  vec2(1, 1),
  vec2(0, 1),
  vec2(-1, 1),
  vec2(-1, 0),
  vec2(-1, -1),
  vec2(0, -1),
  vec2(1, -1),
];
const PERLIN_CORNERS_2D = [vec2(0, 0), vec2(1, 0), vec2(0, 1), vec2(1, 1)];

function perlinGradient2d(index) {
  return PERLIN_GRADIENTS_2D[
    perlinTable[index.x + perlinTable[index.y]] % PERLIN_GRADIENTS_2D.length
  ];
}

export default sumOctaves((value, { interpolate }) => {
  // Wrap negative values
  value = vec2(
    value.x < 0 ? Number.MAX_SAFE_INTEGER + value.x : value.x,
    value.y < 0 ? Number.MAX_SAFE_INTEGER + value.y : value.y
  );
  const gridIndex = value.floor();
  const gridPoint = value.sub(gridIndex);
  const modIndex = gridIndex.mod(
    vec2(PERLIN_TABLE_HALF_SIZE, PERLIN_TABLE_HALF_SIZE)
  );

  // Find the gradient at the corners
  const gradient0 = perlinGradient2d(modIndex.add(PERLIN_CORNERS_2D[0]));
  const gradient1 = perlinGradient2d(modIndex.add(PERLIN_CORNERS_2D[1]));
  const gradient2 = perlinGradient2d(modIndex.add(PERLIN_CORNERS_2D[2]));
  const gradient3 = perlinGradient2d(modIndex.add(PERLIN_CORNERS_2D[3]));

  // Create vectors from the corners to the point inside the grid cell
  const v0 = gridPoint.sub(PERLIN_CORNERS_2D[0]);
  const v1 = gridPoint.sub(PERLIN_CORNERS_2D[1]);
  const v2 = gridPoint.sub(PERLIN_CORNERS_2D[2]);
  const v3 = gridPoint.sub(PERLIN_CORNERS_2D[3]);

  // Work out the dot product of the gradient and the vectors
  const dot0 = gradient0.dot(v0);
  const dot1 = gradient1.dot(v1);
  const dot2 = gradient2.dot(v2);
  const dot3 = gradient3.dot(v3);

  const result = lerp(
    lerp(dot0, dot1, interpolate(0, 1, gridPoint.x)),
    lerp(dot2, dot3, interpolate(0, 1, gridPoint.x)),
    interpolate(0, 1, gridPoint.y)
  );

  return remap(result, -1, 1, 0, 1);
});
