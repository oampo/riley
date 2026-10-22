import * as fs from "fs/promises";
import * as http from "http";
import * as path from "path";
import * as url from "url";

import { checkState } from "../base";
import type { Compiler } from "./compiler";
import { BuildResultType, compiler } from "./compiler";

interface DevServer {
  start(): void;
}

interface Sketch {
  path: string;
  dir: string;
  entryPoint: string;
  state:
    | { status: "pending"; promise: Promise<void> }
    | {
        status: "error";
        errors: BuildError[];
      }
    | {
        status: "success";
        text: string;
      };
  listeners: { [id: number]: http.ServerResponse };
}

type BuildError = {
  text: string;
  location:
    | {
        file: string;
        /** 1-based */
        line: number;
        /** 0-based, in bytes */
        column: number;
        lineText: string;
      }
    | undefined;
};

interface Route {
  method: "GET";
  path: RegExp;
  callback: (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    match: RegExpMatchArray,
  ) => Promise<void>;
}

class DevServerImpl implements DevServer {
  private readonly compiler: Compiler = compiler();
  private readonly sketchMap: Map<string, Sketch> = new Map();
  private readonly server: http.Server;
  private static listenerId: number = 0;

  constructor(private readonly dir: string) {
    this.server = http.createServer(
      (req: http.IncomingMessage, res: http.ServerResponse) => {
        checkState(req.url != null, "No request URL found");
        const url = new URL(req.url, `http://${req.headers.host}`);

        for (const route of this.routes) {
          if (req.method === route.method) {
            const match = url.pathname.match(route.path);
            if (match) {
              void route.callback(req, res, match);
              break;
            }
          }
        }
      },
    );
  }

  start(): void {
    this.server.listen(3000, () => {
      console.log("Listening on http://localhost:3000");
    });
  }

  private get routes(): Route[] {
    return [
      {
        method: "GET",
        path: /^\/(.*)\/index\.html$/,
        callback: (_req, res, match) =>
          this.indexHtml(res, this.normalizePath(match[1])),
      },
      {
        method: "GET",
        path: /^\/(.*)\/index\.js/,
        callback: async (
          _req: http.IncomingMessage,
          res: http.ServerResponse,
          match: RegExpMatchArray,
        ) => this.indexJs(res, this.normalizePath(match[1])),
      },
      {
        method: "GET",
        path: /^\/(.*)\/events/,
        callback: async (
          req: http.IncomingMessage,
          res: http.ServerResponse,
          match: RegExpMatchArray,
        ) => this.events(req, res, this.normalizePath(match[1])),
      },
      {
        method: "GET",
        path: /^\/(.+)$/,
        callback: async (
          _req: http.IncomingMessage,
          res: http.ServerResponse,
          match: RegExpMatchArray,
        ): Promise<void> => this.index(res, this.normalizePath(match[1])),
      },
    ];
  }

  private indexHtml(
    res: http.ServerResponse,
    sketchPath: string,
  ): Promise<void> {
    res.writeHead(301, {
      Location: `/${sketchPath}`,
    });
    res.end();
    return Promise.resolve();
  }

  private async index(
    res: http.ServerResponse,
    sketchPath: string,
  ): Promise<void> {
    const entryPoint = this.entryPoint(sketchPath);
    console.log(entryPoint);
    try {
      await fs.stat(entryPoint);
    } catch {
      res.writeHead(404, {
        "Content-Type": "text/plain",
      });
      res.end(http.STATUS_CODES[404]);
      return;
    }

    const sketch = this.getOrCreateSketch(sketchPath, entryPoint);

    if (sketch.state.status === "pending") {
      await sketch.state.promise;
    }

    if (sketch.state.status === "error") {
      const indexPath = path.join(
        url.fileURLToPath(import.meta.url),
        "..",
        "..",
        "views",
        "sketch-error.html",
      );
      const indexTemplate = await fs.readFile(indexPath, "utf-8");

      const errors = this.renderErrors(sketch.state.errors);

      const indexHtml = indexTemplate
        .replace(/{{\s*EVENT_URL\s*}}/, path.join("/", sketchPath, "events"))
        .replace(/{{\s*ERRORS\s*}}/, errors);
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      res.end(indexHtml);
      return;
    }

    const indexPath = path.join(
      url.fileURLToPath(import.meta.url),
      "..",
      "..",
      "views",
      "sketch.html",
    );
    const indexTemplate = await fs.readFile(indexPath, "utf-8");

    const indexHtml = indexTemplate
      .replace(/{{\s*INDEX_JS\s*}}/, path.join("/", sketchPath, "index.js"))
      .replace(/{{\s*EVENT_URL\s*}}/, path.join("/", sketchPath, "events"));
    res.writeHead(200, {
      "Content-Type": "text/html",
    });
    res.end(indexHtml);
  }

  private async indexJs(
    res: http.ServerResponse,
    sketchPath: string,
  ): Promise<void> {
    const entryPoint = this.entryPoint(sketchPath);

    try {
      await fs.stat(entryPoint);
    } catch {
      res.writeHead(404, {
        "Content-Type": "text/plain",
      });
      res.end(http.STATUS_CODES[404]);
      return;
    }

    const sketch = this.getOrCreateSketch(sketchPath, entryPoint);
    if (sketch.state.status === "pending") {
      await sketch.state.promise;
    }
    res.writeHead(200, {
      "Content-Type": "application/javascript",
    });
    res.end(sketch.state.status === "success" ? sketch.state.text : "");
  }

  private async events(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    sketchPath: string,
  ): Promise<void> {
    const entryPoint = this.entryPoint(sketchPath);

    try {
      await fs.stat(entryPoint);
    } catch {
      res.writeHead(404, {
        "Content-Type": "text/plain",
      });
      res.end(http.STATUS_CODES[404]);
      return;
    }

    const sketch = this.getOrCreateSketch(sketchPath, entryPoint);
    const id = DevServerImpl.listenerId++;
    sketch.listeners[id] = res;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    req.on("close", () => {
      if (!sketch) return;
      const { [id]: _, ...rest } = sketch.listeners;
      sketch.listeners = rest;
    });
  }

  private getOrCreateSketch(sketchPath: string, entryPoint: string): Sketch {
    let sketch = this.sketchMap.get(sketchPath);
    if (!sketch) {
      const { promise, resolve } = Promise.withResolvers<void>();
      sketch = {
        path: sketchPath,
        entryPoint,
        dir: this.sketchDir(sketchPath),
        state: { status: "pending", promise },
        listeners: {},
      };
      this.sketchMap.set(sketchPath, sketch);
      void this.build(sketch, resolve);
    }
    return sketch;
  }

  private normalizePath(sketchPath: string): string {
    return sketchPath
      .split("/")
      .filter((x) => x)
      .join("/");
  }

  private entryPoint(sketchPath: string): string {
    return path.join(this.dir, sketchPath, "src", "index.ts");
  }

  private sketchDir(sketchPath: string): string {
    return path.join(this.dir, sketchPath);
  }

  private notifyListeners(sketch: Sketch): void {
    const payload = JSON.stringify({
      reload: true,
    });
    for (const res of Object.values(sketch.listeners)) {
      res.write(`data: ${payload}\n\n`);
    }
  }

  private async build(sketch: Sketch, resolve: () => void): Promise<void> {
    let isFirstBuild = true;

    await this.compiler.watch(sketch.dir, (result) => {
      switch (result.type) {
        case BuildResultType.SUCCESS: {
          sketch.state = {
            status: "success",
            text: result.text,
          };
          break;
        }
        case BuildResultType.ERROR: {
          sketch.state = {
            status: "error",
            errors: result.errors,
          };
        }
      }
      if (isFirstBuild) {
        isFirstBuild = false;
        resolve();
      } else {
        this.notifyListeners(sketch);
      }
    });
  }

  private renderErrors(errors: BuildError[]): string {
    let lineNumberPadding = 0;
    for (const error of errors) {
      if (!error.location) {
        continue;
      }
      const padding = error.location.line.toString().length;
      if (padding > lineNumberPadding) {
        lineNumberPadding = padding;
      }
    }

    return `
    <section class="errors">
      <ul class="error-list">
        ${errors
          .map(
            (error) =>
              `<li class="error-list-item">
            <h2 class="error-text">${error.text}</h2>
            ${
              error.location &&
              `<p class="error-location">${error.location.file}:${
                error.location.line
              }:${error.location.column}</p>
              <pre><code class="error-line-text">${error.location.line
                .toString()
                .padStart(lineNumberPadding)} | ${error.location.lineText}
${"^".padStart(error.location.column + lineNumberPadding + 4)}
              </code></pre>`
            }
          </li>`,
          )
          .join("")}
      </ul>
    </section>
  `;
  }
}

export default function startDevServer(dir: string): void {
  const devServer = new DevServerImpl(dir);
  devServer.start();
}
