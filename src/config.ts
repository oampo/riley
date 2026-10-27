import type { RgbaColor } from "./color";
import { rgb } from "./color";
import type { Vec2 } from "./math";
import { vec2 } from "./math";
import type { PartialPlotterConfig, PlotterConfig } from "./plotter/config";
import { mergePlotterConfig } from "./plotter/config";
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
  readonly defaultColor: RgbaColor;
  readonly defaultWeight: number;
  readonly backgroundColor: RgbaColor;
  readonly timestep: number;
  readonly defaultResolution: number;
  readonly epsilon: number;
  readonly seed: number | string;
  readonly optimization: OptimizationConfig;
  readonly plotter: PlotterConfig | undefined;
};

export type PartialConfig = Partial<
  Omit<ConfigOpts, "plotter" | "optimization">
> & {
  optimization?: Partial<OptimizationConfig>;
  plotter?: PartialPlotterConfig | undefined;
};

type OptimizationConfig = {
  readonly mergeThreshold: number;
};

export type Config = Omit<ConfigOpts, "paper"> & {
  readonly size: Vec2;
};

class ConfigImpl implements Config {
  paperSize: PaperSize = "A3";
  paperOrientation: PaperOrientation = "portrait";
  defaultColor: RgbaColor = rgb(0, 0, 0);
  defaultWeight: number = 1;
  backgroundColor: RgbaColor = rgb(1, 1, 1);
  timestep: number = 1 / 60;
  defaultResolution: number = 2;
  epsilon: number = 1e-6;
  seed: number | string = randomId();
  optimization: {
    mergeThreshold: number;
  } = { mergeThreshold: 1 };
  plotter: PlotterConfig | undefined;

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

  merge(config: PartialConfig): void {
    if (config.paperSize != null) {
      this.paperSize = config.paperSize;
    }
    if (config.paperOrientation != null)
      this.paperOrientation = config.paperOrientation;
    if (config.defaultColor != null) this.defaultColor = config.defaultColor;
    if (config.defaultWeight != null) this.defaultWeight = config.defaultWeight;
    if (config.backgroundColor != null)
      this.backgroundColor = config.backgroundColor;
    if (config.timestep != null) this.timestep = config.timestep;
    if (config.defaultResolution != null)
      this.defaultResolution = config.defaultResolution;
    if (config.epsilon != null) this.epsilon = config.epsilon;
    if (config.seed != null) this.seed = config.seed;
    if (config.optimization != null) {
      this.optimization = {
        ...this.optimization,
        ...config.optimization,
      };
    }
    if (config.plotter != null) {
      this.plotter = mergePlotterConfig(config.plotter);
    }
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

export function setConfig(c: PartialConfig): void {
  const config = ConfigImpl.create();
  config.merge(c);
}
