import type { Vec3 } from "../math";
import { vec3 } from "../math";

export const enum PlotterType {
  IDRAW_H = "idraw_h",
}

export type PlotterConfig<T extends PlotterTypeConfig = PlotterTypeConfig> = (
  | {
      port?: string;
      nickname?: never;
    }
  | {
      port?: never;
      nickname?: string;
    }
) &
  T;

export type PlotterTypeConfig = IDrawHPlotterConfig;
export type PartialPlotterConfig = DiscriminatedPartial<PlotterConfig>;

type DiscriminatedPartial<T extends { type: string }> = T extends unknown
  ? { type: T["type"] } & Partial<Omit<T, "type">>
  : never;

export type GrblPlotterConfig = {
  moveVelocity: number; // mm/s
  drawVelocity: number; // mm/s
  acceleration: Vec3; // mm/s^2
  penRaiseVelocity: number; // mm/s
  penLowerVelocity: number; // mm/s
};

export function grblPlotterConfigDefaults(): GrblPlotterConfig {
  return {
    moveVelocity: 130,
    drawVelocity: 30,
    acceleration: vec3(3000, 2000, 3000),
    penRaiseVelocity: 160,
    penLowerVelocity: 160,
  };
}

export type IDrawHPlotterConfig = {
  type: PlotterType.IDRAW_H;
} & GrblPlotterConfig;

export function iDrawHPlotterConfigDefaults(): IDrawHPlotterConfig {
  return {
    type: PlotterType.IDRAW_H,
    ...grblPlotterConfigDefaults(),
  };
}

export function mergePlotterConfig(
  config: PartialPlotterConfig,
): PlotterConfig {
  return {
    ...iDrawHPlotterConfigDefaults(),
    ...config,
  };
}
