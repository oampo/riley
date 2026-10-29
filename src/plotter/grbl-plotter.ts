import type { PortInfo } from "@serialport/bindings-cpp";
import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

import { exists, UnreachableError } from "../base";
import type { Queue } from "../data-structures/queue";
import { queue } from "../data-structures/queue";
import type { Line } from "../line";
import type { Plotter } from ".";
import type { GrblPlotterConfig } from "./config";

export enum GrblCommandType {
  HOME = "home",
  SLEEP = "sleep",
  DWELL = "dwell",
  MOVE = "move",
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
    };

const BASE_PEN_DWELL_MS = 50;
const BASE_MOVE_DWELL_MS = 100;
const RX_BUFFER_SIZE = 128;

export class GrblPlotter implements Plotter {
  private readonly port: SerialPort;
  private readonly parser: ReadlineParser;
  private readonly responseQueue: Queue<string> = queue();
  private resolveResponse: ((response: string | undefined) => void) | undefined;

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
    this.parser.on("data", (line: string) => {
      if (this.resolveResponse) {
        const resolve = this.resolveResponse;
        this.resolveResponse = undefined;
        resolve(line);
      } else {
        this.responseQueue.enqueue(line);
      }
    });
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

  async readline({
    timeout = 1000,
  }: { timeout?: number | undefined } = {}): Promise<string | undefined> {
    // If responses are already waiting in the queue, grab the oldest one immediately
    if (this.responseQueue.length > 0) {
      return Promise.resolve(this.responseQueue.dequeue());
    }

    const { promise, resolve } = Promise.withResolvers<string | undefined>();
    this.resolveResponse = resolve;

    let timer: NodeJS.Timeout | undefined;
    if (timeout != null) {
      timer = setTimeout(() => {
        if (this.resolveResponse === resolve) {
          this.resolveResponse = undefined;
          resolve(undefined);
        }
      }, timeout);
    }

    const result = await promise;
    if (timer) {
      clearTimeout(timer);
    }
    return result;
  }

  private sendCommand(
    command: GrblCommand | string,
    { drain = true }: { drain?: boolean } = {},
  ): Promise<void> {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    const commandString =
      typeof command === "string" ? command : this.commandString(command);

    this.port.write(`${commandString}\n`, "ascii", (e) => {
      if (e) {
        return reject(e);
      }
      // If we aren't draining, resolve immediately after write finishes
      if (!drain) {
        resolve();
      }
    });

    if (drain) {
      this.port.drain((e) => {
        if (e) {
          return reject(e);
        }
        resolve();
      });
    }

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

  plot(lines: Line[]): Promise<void> {
    const commands: GrblCommand[] = [];
    // Home the plotter
    commands.push({ type: GrblCommandType.HOME });
    // Set the pen in the pen-up position, and dwell
    commands.push({
      type: GrblCommandType.MOVE,
      z: this.config.penUpHeight,
      velocityMms: this.config.penRaiseVelocity,
    });
    commands.push({
      type: GrblCommandType.DWELL,
      timeMs: BASE_PEN_DWELL_MS,
    });
    for (const line of lines) {
      for (const [i, { x, y }] of line.vertices.entries()) {
        if (i === 0) {
          // Move to the start point
          commands.push({
            type: GrblCommandType.MOVE,
            x,
            y,
            velocityMms: this.config.moveVelocity,
          });
          // Place the pen down
          commands.push({
            type: GrblCommandType.MOVE,
            z: this.config.penDownHeight,
            velocityMms: this.config.penLowerVelocity,
          });
          commands.push({
            type: GrblCommandType.DWELL,
            timeMs: BASE_PEN_DWELL_MS + this.config.penLowerDelay,
          });
          continue;
        }

        commands.push({
          type: GrblCommandType.MOVE,
          x,
          y,
          // Only need to send velocity on the first draw step, then it'll be inherited
          velocityMms: i === 1 ? this.config.moveVelocity : undefined,
        });
      }
      // Lift the pen up
      commands.push({
        type: GrblCommandType.MOVE,
        z: this.config.penUpHeight,
        velocityMms: this.config.penRaiseVelocity,
      });
      commands.push({
        type: GrblCommandType.DWELL,
        timeMs: BASE_PEN_DWELL_MS + this.config.penRaiseDelay,
      });
    }
    // Move back to 0, 0
    commands.push({
      type: GrblCommandType.MOVE,
      x: 0,
      y: 0,
      velocityMms: this.config.moveVelocity,
    });
    commands.push({
      type: GrblCommandType.DWELL,
      timeMs: BASE_MOVE_DWELL_MS,
    });
    commands.push({ type: GrblCommandType.SLEEP });
    return this.stream(commands);
  }

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

  private async stream(
    commands: GrblCommand[],
    { timeout = 10000 }: { timeout?: number | undefined } = {},
  ): Promise<void> {
    const pendingLengths: number[] = [];
    let currentBufferBytes = 0;

    for (const command of commands) {
      const commandString = this.commandString(command);
      const commandLength = commandString.length + 1; // Account for the newline character '\n'

      while (currentBufferBytes + commandLength >= RX_BUFFER_SIZE - 1) {
        const response = await this.readline({ timeout });
        if (response == null) {
          throw new Error("Streaming timed out waiting for response");
        }
        if (response === "ok" || response.startsWith("error")) {
          const freed = pendingLengths.shift();
          if (freed != null) {
            currentBufferBytes -= freed;
          }
        }
      }

      await this.sendCommand(commandString, { drain: false });
      pendingLengths.push(commandLength);
      currentBufferBytes += commandLength;
    }

    // Drain Phase: Wait for all remaining buffered commands to finish executing
    while (pendingLengths.length > 0) {
      const response = await this.readline({ timeout });
      if (response == null) {
        throw new Error("Streaming timed out waiting for response");
      }
      if (response === "ok" || response.startsWith("error")) {
        const freed = pendingLengths.shift();
        if (freed != null) {
          currentBufferBytes -= freed;
        }
      }
    }
  }
}
