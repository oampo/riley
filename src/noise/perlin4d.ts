import { lerp, remap, vec4 } from "../math";
import { perlinTable, PERLIN_TABLE_HALF_SIZE } from "./perlin";
import { sumOctaves } from "./util";

const PERLIN_GRADIENTS_4D = [
  vec4(0, 1, 1, 1),
  vec4(0, 1, 1, -1),
  vec4(0, 1, -1, 1),
  vec4(0, 1, -1, -1),
  vec4(0, -1, 1, 1),
  vec4(0, -1, 1, -1),
  vec4(0, -1, -1, 1),
  vec4(0, -1, -1, -1),
  vec4(1, 0, 1, 1),
  vec4(1, 0, 1, -1),
  vec4(1, 0, -1, 1),
  vec4(1, 0, -1, -1),
  vec4(-1, 0, 1, 1),
  vec4(-1, 0, 1, -1),
  vec4(-1, 0, -1, 1),
  vec4(-1, 0, -1, -1),
  vec4(1, 1, 0, 1),
  vec4(1, 1, 0, -1),
  vec4(1, -1, 0, 1),
  vec4(1, -1, 0, -1),
  vec4(-1, 1, 0, 1),
  vec4(-1, 1, 0, -1),
  vec4(-1, -1, 0, 1),
  vec4(-1, -1, 0, -1),
  vec4(1, 1, 1, 0),
  vec4(1, 1, -1, 0),
  vec4(1, -1, 1, 0),
  vec4(1, -1, -1, 0),
  vec4(-1, 1, 1, 0),
  vec4(-1, 1, -1, 0),
  vec4(-1, -1, 1, 0),
  vec4(-1, -1, -1, 0),
];
const PERLIN_CORNERS_4D = [
  vec4(0, 0, 0, 0),
  vec4(1, 0, 0, 0),
  vec4(0, 1, 0, 0),
  vec4(1, 1, 0, 0),
  vec4(0, 0, 1, 0),
  vec4(1, 0, 1, 0),
  vec4(0, 1, 1, 0),
  vec4(1, 1, 1, 0),
  vec4(0, 0, 0, 1),
  vec4(1, 0, 0, 1),
  vec4(0, 1, 0, 1),
  vec4(1, 1, 0, 1),
  vec4(0, 0, 1, 1),
  vec4(1, 0, 1, 1),
  vec4(0, 1, 1, 1),
  vec4(1, 1, 1, 1),
];

function perlinGradient4d(index) {
  return PERLIN_GRADIENTS_4D[
    perlinTable[
      index.x +
        perlinTable[index.y + perlinTable[index.z + perlinTable[index.w]]]
    ] % PERLIN_GRADIENTS_4D.length
  ];
}

export default sumOctaves((value, { interpolate }) => {
  // Wrap negative values
  value = vec4(
    value.x < 0 ? Number.MAX_SAFE_INTEGER + value.x : value.x,
    value.y < 0 ? Number.MAX_SAFE_INTEGER + value.y : value.y,
    value.z < 0 ? Number.MAX_SAFE_INTEGER + value.z : value.z,
    value.w < 0 ? Number.MAX_SAFE_INTEGER + value.w : value.w
  );
  const gridIndex = value.floor();
  const gridPoint = value.sub(gridIndex);
  const modIndex = gridIndex.mod(
    vec4(
      PERLIN_TABLE_HALF_SIZE,
      PERLIN_TABLE_HALF_SIZE,
      PERLIN_TABLE_HALF_SIZE,
      PERLIN_TABLE_HALF_SIZE
    )
  );

  // Find the gradient at the corners
  const gradient0 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[0]));
  const gradient1 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[1]));
  const gradient2 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[2]));
  const gradient3 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[3]));
  const gradient4 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[4]));
  const gradient5 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[5]));
  const gradient6 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[6]));
  const gradient7 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[7]));
  const gradient8 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[8]));
  const gradient9 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[9]));
  const gradient10 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[10]));
  const gradient11 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[11]));
  const gradient12 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[12]));
  const gradient13 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[13]));
  const gradient14 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[14]));
  const gradient15 = perlinGradient4d(modIndex.add(PERLIN_CORNERS_4D[15]));

  // Create vectors from the corners to the point inside the grid cell
  const v0 = gridPoint.sub(PERLIN_CORNERS_4D[0]);
  const v1 = gridPoint.sub(PERLIN_CORNERS_4D[1]);
  const v2 = gridPoint.sub(PERLIN_CORNERS_4D[2]);
  const v3 = gridPoint.sub(PERLIN_CORNERS_4D[3]);
  const v4 = gridPoint.sub(PERLIN_CORNERS_4D[4]);
  const v5 = gridPoint.sub(PERLIN_CORNERS_4D[5]);
  const v6 = gridPoint.sub(PERLIN_CORNERS_4D[6]);
  const v7 = gridPoint.sub(PERLIN_CORNERS_4D[7]);
  const v8 = gridPoint.sub(PERLIN_CORNERS_4D[8]);
  const v9 = gridPoint.sub(PERLIN_CORNERS_4D[9]);
  const v10 = gridPoint.sub(PERLIN_CORNERS_4D[10]);
  const v11 = gridPoint.sub(PERLIN_CORNERS_4D[11]);
  const v12 = gridPoint.sub(PERLIN_CORNERS_4D[12]);
  const v13 = gridPoint.sub(PERLIN_CORNERS_4D[13]);
  const v14 = gridPoint.sub(PERLIN_CORNERS_4D[14]);
  const v15 = gridPoint.sub(PERLIN_CORNERS_4D[15]);

  // Work out the dot product of the gradient and the vectors
  const dot0 = gradient0.dot(v0);
  const dot1 = gradient1.dot(v1);
  const dot2 = gradient2.dot(v2);
  const dot3 = gradient3.dot(v3);
  const dot4 = gradient4.dot(v4);
  const dot5 = gradient5.dot(v5);
  const dot6 = gradient6.dot(v6);
  const dot7 = gradient7.dot(v7);
  const dot8 = gradient8.dot(v8);
  const dot9 = gradient9.dot(v9);
  const dot10 = gradient10.dot(v10);
  const dot11 = gradient11.dot(v11);
  const dot12 = gradient12.dot(v12);
  const dot13 = gradient13.dot(v13);
  const dot14 = gradient14.dot(v14);
  const dot15 = gradient15.dot(v15);

  const result = lerp(
    lerp(
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
    ),
    lerp(
      lerp(
        lerp(dot8, dot9, interpolate(0, 1, gridPoint.x)),
        lerp(dot10, dot11, interpolate(0, 1, gridPoint.x)),
        interpolate(0, 1, gridPoint.y)
      ),
      lerp(
        lerp(dot12, dot13, interpolate(0, 1, gridPoint.x)),
        lerp(dot14, dot15, interpolate(0, 1, gridPoint.x)),
        interpolate(0, 1, gridPoint.y)
      ),
      interpolate(0, 1, gridPoint.z)
    ),
    interpolate(0, 1, gridPoint.w)
  );

  return remap(result, -1, 1, 0, 1);
});
