import type { PortInfo } from "@serialport/bindings-cpp";
import { SerialPort } from "serialport";

import { exists } from "../base";
import type { Line } from "../line";
import { IDrawHPlotterFactory } from "./idraw-h";

export const enum PlotterType {
  IDRAW_H = "idraw_h",
}

export interface PlotterFactory {
  type: PlotterType;
  create(port: PortInfo): Plotter;
  match(ports: PortInfo[]): Promise<PlotterInfo[]>;
}

export type PlotterInfo = {
  nickname?: string;
  port: PortInfo;
};

const plotterFactories: PlotterFactory[] = [new IDrawHPlotterFactory()];

export interface Plotter {
  plot(lines: Line[]): void;
}

export async function listPlotters(): Promise<void> {
  const ports = await SerialPort.list();
  for (const factory of plotterFactories) {
    const matches = await factory.match(ports);
    for (const match of matches) {
      console.log(
        `${[factory.type, match.nickname].filter(exists).join(": ")} (${match.port.path})`,
      );
    }
  }
}
