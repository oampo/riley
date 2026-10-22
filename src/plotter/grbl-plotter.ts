import type { PortInfo } from "@serialport/bindings-cpp";
import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

import type { Plotter } from ".";

export const enum GrblCommand {}

export class GrblPlotter<ExtCommand extends string> implements Plotter {
  private readonly port: SerialPort;
  private readonly parser: ReadlineParser;

  constructor(portInfo: PortInfo) {
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

  flush(): Promise<void> {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    this.port.flush((e) => {
      if (e) {
        return reject(e);
      }
      resolve();
    });
    return promise;
  }

  sendCommand(command: GrblCommand | ExtCommand): Promise<void> {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    this.port.write(`${command}\n`, "ascii", (e) => {
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
    command: GrblCommand | ExtCommand,
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

  plot(): void {}
}
