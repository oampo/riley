import config from "./config";

export function line(...vertices) {
  return {
    vertices,
    color: config.defaultColor,
    weight: config.defaultWeight,
    layer: 0,
  };
}
