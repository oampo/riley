import { vec2, vec4 } from "./math";
import { randomId } from "./random";
const defaultConfig = {
    autoplay: true,
    paperSize: "A3",
    paperOrientation: "portrait",
    defaultColor: vec4(0, 0, 0, 1),
    defaultWeight: 1,
    mergeThreshold: 1,
    backgroundColor: vec4(1, 1, 1, 1),
    timestep: 1 / 60,
    defaultResolution: 2,
    epsilon: Number.EPSILON * 128,
    absoluteComparisonThreshold: Number.MIN_VALUE,
    seed: randomId(),
    size: vec2(0, 0),
};
export default defaultConfig;
