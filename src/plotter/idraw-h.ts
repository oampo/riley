import type { PortInfo } from "@serialport/bindings-cpp";

import { exists } from "../base";
import { UnreachableError } from "../base";
import type { Plotter, PlotterFactory, PlotterInfo } from ".";
import type { IDrawHPlotterConfig } from "./config";
import { iDrawHPlotterConfigDefaults, PlotterType } from "./config";
import { GrblPlotter } from "./grbl-plotter";

export const enum DrawcoreCommandType {
  QUERY_PAUSE_BUTTON = "$B",
  VERSION = "v",
  QUERY_NICKNAME = "$QT",
}

export type DrawcoreCommand =
  | {
      type: DrawcoreCommandType.QUERY_PAUSE_BUTTON;
    }
  | { type: DrawcoreCommandType.VERSION }
  | { type: DrawcoreCommandType.QUERY_NICKNAME };

export class IDrawHPlotterFactory implements PlotterFactory<IDrawHPlotterConfig> {
  readonly type: PlotterType = PlotterType.IDRAW_H;
  create(port: PortInfo, config: IDrawHPlotterConfig): Plotter {
    return new IDrawHPlotter(port, config);
  }

  async match(ports: PortInfo[]): Promise<PlotterInfo[]> {
    const promises = ports.map(async (port) => {
      if (
        port.vendorId != "1a86" ||
        (port.productId !== "7523" && port.productId !== "8040")
      ) {
        return Promise.resolve(undefined);
      }
      const plotter = new IDrawHPlotter(port, iDrawHPlotterConfigDefaults());
      await plotter.connect();
      let result: { nickname?: string } | undefined;
      try {
        result = await plotter.handshake();
      } finally {
        await plotter.disconnect();
      }

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
  private readonly plotter: GrblPlotter;

  constructor(portInfo: PortInfo, config: IDrawHPlotterConfig) {
    this.plotter = new GrblPlotter(portInfo, config);
  }

  async handshake(): Promise<
    { version: string; nickname?: string } | undefined
  > {
    // Shorter timeout, so we don't have to wait too long to realize its not a
    // valid device
    try {
      await this.plotter.query(
        this.commandString({ type: DrawcoreCommandType.QUERY_PAUSE_BUTTON }),
        {
          timeout: 1000,
        },
      );
    } catch {
      return;
    }
    const version = await this.plotter.query(
      this.commandString({ type: DrawcoreCommandType.VERSION }),
      {
        expectOk: false,
      },
    );
    if (version == null || !version.startsWith("DrawCore")) {
      return;
    }
    let nickname: string | undefined = await this.plotter.query(
      this.commandString({ type: DrawcoreCommandType.QUERY_NICKNAME }),
      {
        optional: true,
      },
    );
    if (nickname.length < 3) {
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

  home(): Promise<void> {
    return this.plotter.home();
  }

  penDown(): Promise<void> {
    return this.plotter.penDown();
  }

  penUp(): Promise<void> {
    return this.plotter.penUp();
  }

  move(x: number, y: number): Promise<void> {
    return this.plotter.move(x, y);
  }

  sleep(): Promise<void> {
    return this.plotter.sleep();
  }

  private commandString(command: DrawcoreCommand): string {
    switch (command.type) {
      case DrawcoreCommandType.QUERY_PAUSE_BUTTON:
        return "$B";
      case DrawcoreCommandType.VERSION:
        return "v";
      case DrawcoreCommandType.QUERY_NICKNAME:
        return "$QT";
      default:
        throw new UnreachableError(command);
    }
  }
}
