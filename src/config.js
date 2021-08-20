import { vec4 } from "gl-matrix";

export default {
  autoplay: true,
  size: "A3",
  orientation: "landscape",
  defaultColor: vec4.fromValues(0, 0, 0, 1),
  backgroundColor: vec4.fromValues(1, 1, 1, 1),
  timestep: 1 / 60,
};
