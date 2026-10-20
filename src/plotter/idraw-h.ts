import type { PortInfo } from "@serialport/bindings-cpp";

import { exists } from "../base";
import type { Plotter, PlotterFactory, PlotterInfo } from ".";
import { PlotterType } from ".";
import { GrblPlotter } from "./grbl-plotter";

export const enum DrawcoreCommands {
  QUERY_PAUSE_BUTTON = "$B",
  VERSION = "v",
  QUERY_NICKNAME = "$QT",
}

export class IDrawHPlotterFactory implements PlotterFactory {
  readonly type: PlotterType = PlotterType.IDRAW_H;
  create(_port: PortInfo): Plotter {
    // Stub
    return { plot(): void {} };
  }

  async match(ports: PortInfo[]): Promise<PlotterInfo[]> {
    const promises = ports.map(async (port) => {
      if (
        port.vendorId != "1A86" ||
        (port.productId !== "7523" && port.productId !== "8040")
      ) {
        return Promise.resolve(undefined);
      }
      const plotter = new IDrawHPlotter(port);
      await plotter.connect();
      const result = await plotter.handshake();
      if (!result) {
        return;
      }
      const { nickname } = result;
      await plotter.disconnect();
      return { port, nickname };
    });
    const results = await Promise.allSettled(promises);
    return results
      .filter((result) => result.status === "fulfilled")
      .map((result) => {
        if (result.value == null) {
          return;
        }
        return result.value;
      })
      .filter(exists);
  }
}

class IDrawHPlotter implements Plotter {
  private readonly plotter: GrblPlotter<DrawcoreCommands>;

  constructor(portInfo: PortInfo) {
    this.plotter = new GrblPlotter<DrawcoreCommands>(portInfo);
  }

  async handshake(): Promise<
    { version: string; nickname?: string } | undefined
  > {
    // Shorter timeout, so we don't have to wait too long to realize its not a
    // valid device
    try {
      await this.plotter.query(DrawcoreCommands.QUERY_PAUSE_BUTTON, {
        timeout: 1000,
      });
    } catch {
      return;
    }
    await this.plotter.flush();
    await this.plotter.sendCommand(DrawcoreCommands.VERSION);
    const version = await this.plotter.readline();
    if (version == null || !version.startsWith("DrawCore")) {
      return;
    }
    let nickname: string | undefined = await this.plotter.query(
      DrawcoreCommands.QUERY_NICKNAME,
    );
    if (nickname == null || nickname.length < 3) {
      // Nicknames must be at least 3 characters long
      nickname = undefined;
    }
    return {
      nickname,
      version,
    };
  }

  connect(): Promise<void> {
    return this.plotter.connect();
  }

  disconnect(): Promise<void> {
    return this.plotter.disconnect();
  }

  plot(): void {
    this.plotter.plot();
  }
}
