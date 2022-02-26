import type { FirstOrderInterpolationFn, Vec3 } from "../math";

import { lerp, remap, vec3 } from "../math";
import { perlinTable, PERLIN_TABLE_HALF_SIZE } from "./perlin";
import { sumOctaves } from "./util";

const PERLIN_GRADIENTS_3D = [
  vec3(1, 1, 1),
  vec3(-1, 1, 1),
  vec3(1, -1, 1),
  vec3(-1, -1, 1),
  vec3(1, 1, 0),
  vec3(-1, 1, 0),
  vec3(1, -1, 0),
  vec3(-1, -1, 0),
  vec3(1, 1, -1),
  vec3(-1, 1, -1),
  vec3(1, -1, -1),
  vec3(-1, -1, -0),
];
const PERLIN_CORNERS_3D = [
  vec3(0, 0, 0),
  vec3(1, 0, 0),
  vec3(0, 1, 0),
  vec3(1, 1, 0),
  vec3(0, 0, 1),
  vec3(1, 0, 1),
  vec3(0, 1, 1),
  vec3(1, 1, 1),
];

function perlinGradient3d(index: Vec3): Vec3 {
  return PERLIN_GRADIENTS_3D[
    perlinTable[index.x + perlinTable[index.y + perlinTable[index.z]]] %
      PERLIN_GRADIENTS_3D.length
  ];
}

export default sumOctaves(
  (
    value: Vec3,
    { interpolate }: { interpolate: FirstOrderInterpolationFn }
  ): number => {
    // Wrap negative values
    value = vec3(
      value.x < 0 ? Number.MAX_SAFE_INTEGER + value.x : value.x,
      value.y < 0 ? Number.MAX_SAFE_INTEGER + value.y : value.y,
      value.z < 0 ? Number.MAX_SAFE_INTEGER + value.z : value.z
    );
    const gridIndex = value.floor();
    const gridPoint = value.sub(gridIndex);
    const modIndex = gridIndex.mod(
      vec3(
        PERLIN_TABLE_HALF_SIZE,
        PERLIN_TABLE_HALF_SIZE,
        PERLIN_TABLE_HALF_SIZE
      )
    );

    // Find the gradient at the corners
    const gradient0 = perlinGradient3d(modIndex.add(PERLIN_CORNERS_3D[0]));
    const gradient1 = perlinGradient3d(modIndex.add(PERLIN_CORNERS_3D[1]));
    const gradient2 = perlinGradient3d(modIndex.add(PERLIN_CORNERS_3D[2]));
    const gradient3 = perlinGradient3d(modIndex.add(PERLIN_CORNERS_3D[3]));
    const gradient4 = perlinGradient3d(modIndex.add(PERLIN_CORNERS_3D[4]));
    const gradient5 = perlinGradient3d(modIndex.add(PERLIN_CORNERS_3D[5]));
    const gradient6 = perlinGradient3d(modIndex.add(PERLIN_CORNERS_3D[6]));
    const gradient7 = perlinGradient3d(modIndex.add(PERLIN_CORNERS_3D[7]));

    // Create vectors from the corners to the point inside the grid cell
    const v0 = gridPoint.sub(PERLIN_CORNERS_3D[0]);
    const v1 = gridPoint.sub(PERLIN_CORNERS_3D[1]);
    const v2 = gridPoint.sub(PERLIN_CORNERS_3D[2]);
    const v3 = gridPoint.sub(PERLIN_CORNERS_3D[3]);
    const v4 = gridPoint.sub(PERLIN_CORNERS_3D[4]);
    const v5 = gridPoint.sub(PERLIN_CORNERS_3D[5]);
    const v6 = gridPoint.sub(PERLIN_CORNERS_3D[6]);
    const v7 = gridPoint.sub(PERLIN_CORNERS_3D[7]);

    // Work out the dot product of the gradient and the vectors
    const dot0 = gradient0.dot(v0);
    const dot1 = gradient1.dot(v1);
    const dot2 = gradient2.dot(v2);
    const dot3 = gradient3.dot(v3);
    const dot4 = gradient4.dot(v4);
    const dot5 = gradient5.dot(v5);
    const dot6 = gradient6.dot(v6);
    const dot7 = gradient7.dot(v7);

    const result = lerp(
      lerp(
        lerp(dot0, dot1, interpolate(0, 1, gridPoint.x)),
        lerp(dot2, dot3, interpolate(0, 1, gridPoint.x)),
        interpolate(0, 1, gridPoint.y)
      ),
      lerp(
        lerp(dot4, dot5, interpolate(0, 1, gridPoint.x)),
        lerp(dot6, dot7, interpolate(0, 1, gridPoint.x)),
        interpolate(0, 1, gridPoint.y)
      ),
      interpolate(0, 1, gridPoint.z)
    );

    return remap(result, -1, 1, 0, 1);
  }
);
