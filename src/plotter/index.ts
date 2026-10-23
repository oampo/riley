import type { PortInfo } from "@serialport/bindings-cpp";
import { SerialPort } from "serialport";

import { checkExists, exists } from "../base";
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
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  plot(lines: Line[]): void;
  home(): Promise<void>;
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

async function getPlotter({
  port,
  nickname,
}: {
  port: string | undefined;
  nickname: string | undefined;
}): Promise<Plotter | undefined> {
  const ports = await SerialPort.list();
  for (const factory of plotterFactories) {
    const matches = await factory.match(ports);
    for (const match of matches) {
      if (
        (port == null && nickname == null) ||
        (port != null && match.port.path === port) ||
        (nickname !== null && match.nickname == nickname)
      ) {
        return factory.create(match.port);
      }
    }
  }
}

export async function home({
  port,
  nickname,
}: {
  port: string | undefined;
  nickname: string | undefined;
}): Promise<void> {
  const plotter = checkExists(
    await getPlotter({ port, nickname }),
    "Could not find plotter",
  );
  await plotter.connect();
  await plotter.home();
  await plotter.sleep();
  await plotter.disconnect();
}
