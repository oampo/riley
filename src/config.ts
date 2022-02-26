import { customAlphabet } from "nanoid";

import { vec2, vec4, Vec2, Vec4 } from "./math";

const nanoid = customAlphabet("0123456789abcdef", 32);

export type PaperSize =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A6"
  | "A7"
  | "A8"
  | "A9"
  | "A10"
  | Vec2;

export type PaperOrientation = "portrait" | "landscape";

export interface Config {
  autoplay: boolean;
  paperSize: PaperSize;
  paperOrientation: PaperOrientation;
  defaultColor: Vec4;
  defaultWeight: number;
  mergeThreshold: number;
  backgroundColor: Vec4;
  timestep: number;
  defaultResolution: number;
  epsilon: number;
  absoluteComparisonThreshold: number;
  seed: number | string;
  size: Vec2;
}

const defaultConfig: Config = {
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
  seed: nanoid(),
  size: vec2(0, 0),
};

export default defaultConfig;
