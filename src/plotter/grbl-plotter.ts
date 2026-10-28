import type { PortInfo } from "@serialport/bindings-cpp";
import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

import { exists, UnreachableError } from "../base";
import type { Plotter } from ".";
import type { GrblPlotterConfig } from "./config";

export enum GrblCommandType {
  HOME = "home",
  SLEEP = "sleep",
  DWELL = "dwell",
  MOVE = "move",
  DRAW = "draw",
}

export type GrblCommand =
  | {
      type: GrblCommandType.HOME;
    }
  | {
      type: GrblCommandType.SLEEP;
    }
  | {
      type: GrblCommandType.DWELL;
      timeMs: number;
    }
  | {
      type: GrblCommandType.MOVE;
      x?: number;
      y?: number;
      z?: number;
      velocityMms?: number;
    }
  | {
      type: GrblCommandType.DRAW;
      x?: number;
      y?: number;
      z?: number;
      velocityMms?: number;
    };

const BASE_PEN_DWELL_MS = 50;
const BASE_MOVE_DWELL_MS = 100;

export class GrblPlotter implements Plotter {
  private readonly port: SerialPort;
  private readonly parser: ReadlineParser;

  constructor(
    portInfo: PortInfo,
    private readonly config: GrblPlotterConfig,
  ) {
    this.port = new SerialPort({
      path: portInfo.path,
      baudRate: 115200,
      autoOpen: false,
    });
    this.parser = this.port.pipe(
      new ReadlineParser({ delimiter: "\r\n", encoding: "ascii" }),
    );
  }

  connect(): Promise<void> {
    if (this.port.isOpen) {
      return Promise.resolve();
    }
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    this.port.open((e) => {
      if (e) {
        return reject(e);
      }
      resolve();
    });
    return promise;
  }

  disconnect(): Promise<void> {
    if (!this.port.isOpen) {
      return Promise.resolve();
    }
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    this.port.close((e) => {
      if (e) {
        return reject(e);
      }
      resolve();
    });
    return promise;
  }

  readline({ timeout = 1000 }: { timeout?: number | undefined } = {}): Promise<
    string | undefined
  > {
    const { promise, resolve } = Promise.withResolvers<string | undefined>();

    this.parser.once("data", (data: string) => {
      resolve(data);
      if (timer) {
        clearTimeout(timer);
      }
    });

    let timer: NodeJS.Timeout | undefined;
    if (timeout != null) {
      timer = setTimeout(() => {
        resolve(undefined);
        this.parser.off("data", resolve);
      }, timeout);
    }

    return promise;
  }

  private sendCommand(command: GrblCommand | string): Promise<void> {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    const commandString =
      typeof command === "string" ? command : this.commandString(command);
    this.port.write(`${commandString}\n`, "ascii", (e) => {
      if (e) {
        return reject(e);
      }
    });
    this.port.drain((e) => {
      if (e) {
        return reject(e);
      }
      resolve();
    });
    return promise;
  }

  async query(
    command: GrblCommand | string,
    {
      timeout = 10000,
      expectOk = true,
      optional = false,
    }: {
      timeout?: number | undefined;
      expectOk?: boolean;
      optional?: boolean;
    } = {},
  ): Promise<string> {
    await this.sendCommand(command);
    const response = await this.readline({ timeout });
    if (response == null) {
      throw new Error("Query timed out without response");
    }
    if (expectOk && optional && response === "ok") {
      return "";
    }
    if (expectOk) {
      const ok = await this.readline({ timeout });

      if (ok == null) {
        throw new Error("Query timed out without ok");
      }
      if (ok !== "ok") {
        throw new Error("Expected ok response");
      }
    }
    return response;
  }

  async command(
    command: GrblCommand | string,
    {
      timeout = 10000,
      expectOk = true,
    }: { timeout?: number | undefined; expectOk?: boolean } = {},
  ): Promise<void> {
    await this.sendCommand(command);
    if (expectOk) {
      const ok = await this.readline({ timeout });

      if (ok == null) {
        throw new Error("Query timed out without ok");
      }
      if (ok !== "ok") {
        throw new Error("Expected ok response");
      }
    }
  }

  plot(): void {}

  home(): Promise<void> {
    return this.command({ type: GrblCommandType.HOME });
  }

  async penDown(): Promise<void> {
    await this.command({
      type: GrblCommandType.MOVE,
      z: this.config.penDownHeight,
      velocityMms: this.config.penLowerVelocity,
    });
    await this.dwell(BASE_PEN_DWELL_MS);
  }

  async penUp(): Promise<void> {
    await this.command({
      type: GrblCommandType.MOVE,
      z: this.config.penUpHeight,
      velocityMms: this.config.penRaiseVelocity,
    });
    await this.dwell(BASE_PEN_DWELL_MS);
  }

  async move(x: number, y: number): Promise<void> {
    await this.penUp();
    await this.command({
      type: GrblCommandType.MOVE,
      x,
      y,
      velocityMms: this.config.moveVelocity,
    });
    await this.dwell(BASE_MOVE_DWELL_MS);
  }

  dwell(timeMs: number): Promise<void> {
    return this.command({
      type: GrblCommandType.DWELL,
      timeMs,
    });
  }

  sleep(): Promise<void> {
    return this.command({
      type: GrblCommandType.SLEEP,
    });
  }

  private commandString(command: GrblCommand): string {
    switch (command.type) {
      case GrblCommandType.HOME:
        return "$H";
      case GrblCommandType.SLEEP:
        return "$SLP";
      case GrblCommandType.MOVE:
        return [
          "G0",
          "G90",
          command.velocityMms != null
            ? `F${(command.velocityMms * 60).toFixed(0)}`
            : undefined,
          command.x != null ? `X${command.x.toFixed(4)}` : undefined,
          command.y != null ? `Y${(-command.y).toFixed(4)}` : undefined,
          command.z != null ? `Z${command.z.toFixed(4)}` : undefined,
        ]
          .filter(exists)
          .join(" ");
      case GrblCommandType.DRAW:
        return [
          "G1",
          "G90",
          command.velocityMms != null
            ? `F${(command.velocityMms * 60).toFixed(0)}`
            : undefined,
          command.x != null ? `X${command.x.toFixed(4)}` : undefined,
          command.y != null ? `Y${(-command.y).toFixed(4)}` : undefined,
          command.z != null ? `Z${command.z.toFixed(4)}` : undefined,
        ]
          .filter(exists)
          .join(" ");
      case GrblCommandType.DWELL:
        return `G4 P${(command.timeMs / 1000).toFixed(4)}`;
      default:
        throw new UnreachableError(command);
    }
  }
}
