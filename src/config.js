import { vec4 } from "gl-matrix";

export default {
  autoplay: true,
  size: "A3",
  orientation: "portrait",
  defaultColor: vec4.fromValues(0, 0, 0, 1),
  defaultWeight: 1,
  backgroundColor: vec4.fromValues(1, 1, 1, 1),
  timestep: 1 / 60,
};