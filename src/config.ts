import type { RgbaColor } from "./color";
import { rgb } from "./color";
import type { Vec2 } from "./math";
import { vec2 } from "./math";
import { randomId } from "./random";

export type PaperSize =
  | "A0"
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

export type ConfigOpts = {
  readonly paperSize: PaperSize;
  readonly paperOrientation: PaperOrientation;
  readonly autoplay: boolean;
  readonly defaultColor: RgbaColor;
  readonly defaultWeight: number;
  readonly mergeThreshold: number;
  readonly backgroundColor: RgbaColor;
  readonly timestep: number;
  readonly defaultResolution: number;
  readonly epsilon: number;
  readonly absoluteComparisonThreshold: number;
  readonly seed: number | string;
};

export type Config = Omit<ConfigOpts, "paper"> & {
  readonly size: Vec2;
};

class ConfigImpl implements Config {
  readonly paperSize: PaperSize = "A3";
  readonly paperOrientation: PaperOrientation = "portrait";
  readonly autoplay: boolean = true;
  readonly defaultColor: RgbaColor = rgb(0, 0, 0);
  readonly defaultWeight: number = 1;
  readonly mergeThreshold: number = 1;
  readonly backgroundColor: RgbaColor = rgb(1, 1, 1);
  readonly timestep: number = 1 / 60;
  readonly defaultResolution: number = 2;
  readonly epsilon: number = Number.EPSILON * 128;
  readonly absoluteComparisonThreshold: number = Number.MIN_VALUE;
  readonly seed: number | string = randomId();

  private constructor() {}

  static instance: ConfigImpl | undefined;
  static create(): ConfigImpl {
    if (!ConfigImpl.instance) {
      const config = new ConfigImpl();
      ConfigImpl.instance = config;
      return config;
    }
    return ConfigImpl.instance;
  }

  merge(config: Partial<ConfigOpts>): void {
    Object.assign(this, config);
  }

  get size(): Vec2 {
    const { paperSize: size, paperOrientation: orientation } = this;
    let vecSize: Vec2;
    if (typeof size === "string") {
      if (!(size in this.paperSizes)) {
        throw new Error(`Unknown paper size: ${size}`);
      }
      vecSize = this.paperSizes[size];
    } else {
      vecSize = size;
    }

    if (orientation === "landscape") {
      return vec2(vecSize.y, vecSize.x);
    }

    return vecSize;
  }

  private get paperSizes(): Record<Exclude<PaperSize, Vec2>, Vec2> {
    return {
      A0: vec2(841, 1189),
      A1: vec2(594, 841),
      A2: vec2(420, 594),
      A3: vec2(297, 420),
      A4: vec2(210, 297),
      A5: vec2(148, 210),
      A6: vec2(105, 148),
      A7: vec2(74, 105),
      A8: vec2(52, 74),
      A9: vec2(37, 52),
      A10: vec2(26, 37),
    };
  }
}

export function getConfig(): Config {
  return ConfigImpl.create();
}

export function setConfig(c: Partial<ConfigOpts>): void {
  const config = ConfigImpl.create();
  config.merge(c);
}
