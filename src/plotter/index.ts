import type { PortInfo } from "@serialport/bindings-cpp";
import { SerialPort } from "serialport";

import { checkExists, exists } from "../base";
import type { Line } from "../line";
import type { PlotterConfig, PlotterType } from "./config";
import { IDrawHPlotterFactory } from "./idraw-h";

export interface PlotterFactory<C extends PlotterConfig = PlotterConfig> {
  type: PlotterType;
  create(port: PortInfo, config: C): Plotter;
  match(ports: PortInfo[]): Promise<PlotterInfo[]>;
}

export type PlotterInfo = {
  nickname?: string;
  port: PortInfo;
};

const plotterFactories: PlotterFactory[] = [new IDrawHPlotterFactory()];

export interface Plotter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  plot(lines: Line[]): void;
  home(): Promise<void>;
  penUp(): Promise<void>;
  penDown(): Promise<void>;
  move(x: number, y: number): Promise<void>;
  sleep(): Promise<void>;
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

export async function getPlotter(
  config: PlotterConfig,
): Promise<Plotter | undefined> {
  const { type, port, nickname } = config;
  const ports = await SerialPort.list();
  const factory = checkExists(plotterFactories.find((f) => f.type === type));
  const matches = await factory.match(ports);
  for (const match of matches) {
    if (
      (port == null && nickname == null) ||
      (port != null && match.port.path === port) ||
      (nickname !== null && match.nickname == nickname)
    ) {
      return factory.create(match.port, config);
    }
  }
}
