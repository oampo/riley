import * as fs from "fs/promises";
import * as http from "http";
import * as path from "path";
import * as url from "url";

import esbuild from "esbuild";

let listenerId = 0;

interface Sketch {
  name: string;
  entryPoint: string;
  errors: esbuild.Message[];
  warnings: esbuild.Message[];
  text: string | null;
  listeners: { [id: number]: http.ServerResponse };
}

type SketchMap = Map<string, Sketch>;

interface Route {
  method: "GET";
  path: RegExp;
  callback: (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    match: RegExpMatchArray
  ) => void;
}

const skipFirstBuildPlugin: esbuild.Plugin = {
  name: "skipFirstBuild",

  setup(build) {
    let isFirstBuild = true;
    build.onLoad({ filter: /.*/ }, () => {
      if (isFirstBuild) {
        isFirstBuild = false;
        return {
          contents: "",
        };
      }
    });
  },
};

function notifyListeners(sketch: Sketch): void {
  const payload = JSON.stringify({
    reload: true,
  });
  for (const res of Object.values(sketch.listeners)) {
    res.write(`data: ${payload}\n\n`);
  }
}

async function build(sketch: Sketch): Promise<Sketch> {
  let builder;
  try {
    builder = await esbuild.build({
      entryPoints: [sketch.entryPoint],
      bundle: true,
      watch: {
        onRebuild: (
          err: esbuild.BuildFailure | null,
          result: esbuild.BuildResult | null
        ) => {
          if (err) {
            sketch.text = null;
            sketch.errors = err.errors;
            sketch.warnings = err.warnings;
            notifyListeners(sketch);
            return;
          }

          if (!result || !result.outputFiles || !result.outputFiles.length) {
            throw new Error("Expected result containing output files");
          }

          sketch.text = result.outputFiles[0].text;
          sketch.errors = result.errors;
          sketch.warnings = result.warnings;
          notifyListeners(sketch);
        },
      },
      write: false,
      outdir: "",
      incremental: true,
      globalName: "sketch",
      plugins: [skipFirstBuildPlugin],
    });
  } catch (error) {
    throw new Error("Unexpected failure of initial build");
  }

  if (!builder.rebuild) {
    throw new Error("Expected builder to have rebuild method");
  }

  try {
    const result = await builder.rebuild();
    if (!result || !result.outputFiles || !result.outputFiles.length) {
      throw new Error("Expected result containing output files");
    }
    sketch.text = result.outputFiles[0].text;
    sketch.errors = result.errors;
    sketch.warnings = result.warnings;
  } catch (err) {
    sketch.text = null;
    sketch.errors = (err as esbuild.BuildFailure).errors;
    sketch.warnings = (err as esbuild.BuildFailure).warnings;
  }

  return sketch;
}

function renderErrors(sketch: Sketch) {
  if (!sketch.errors.length) {
    return "";
  }

  let lineNumberPadding = 0;
  for (const error of sketch.errors) {
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
        ${sketch.errors.map(
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
          </li>`
        )}
      </ul>
    </section>
  `;
}

export default async function startDevServer(dir: string): Promise<void> {
  const sketchMap: SketchMap = new Map();

  const routes: Route[] = [
    {
      method: "GET",
      path: /^\/(.*)\/index\.html$/,
      callback: (
        req: http.IncomingMessage,
        res: http.ServerResponse,
        match: RegExpMatchArray
      ) => {
        const name = match[1]
          .split("/")
          .filter((x) => x)
          .join("/");
        res.writeHead(301, {
          Location: `/${name}`,
        });
        res.end();
      },
    },
    {
      method: "GET",
      path: /^\/(.*)\/index\.js/,
      callback: async (
        req: http.IncomingMessage,
        res: http.ServerResponse,
        match: RegExpMatchArray
      ) => {
        const name = match[1]
          .split("/")
          .filter((x) => x)
          .join("/");
        const entryPoint = path.join(dir, name, "src", "index.js");

        try {
          await fs.stat(entryPoint);
        } catch (err) {
          res.writeHead(404, {
            "Content-Type": "text/plain",
          });
          res.end(http.STATUS_CODES[404]);
          return;
        }

        let sketch = sketchMap.get(name);
        if (!sketch) {
          sketch = {
            name,
            entryPoint,
            errors: [],
            warnings: [],
            text: null,
            listeners: {},
          };
          sketchMap.set(name, sketch);
          await build(sketch);
        }
        res.writeHead(200, {
          "Content-Type": "application/javascript",
        });
        res.end(sketch.text ?? "");
      },
    },
    {
      method: "GET",
      path: /^\/(.*)\/events/,
      callback: async (
        req: http.IncomingMessage,
        res: http.ServerResponse,
        match: RegExpMatchArray
      ) => {
        const name = match[1]
          .split("/")
          .filter((x) => x)
          .join("/");
        const entryPoint = path.join(dir, name, "src", "index.js");

        try {
          await fs.stat(entryPoint);
        } catch (err) {
          res.writeHead(404, {
            "Content-Type": "text/plain",
          });
          res.end(http.STATUS_CODES[404]);
          return;
        }

        let sketch = sketchMap.get(name);
        if (!sketch) {
          sketch = {
            name,
            entryPoint,
            errors: [],
            warnings: [],
            text: null,
            listeners: {},
          };
          sketchMap.set(name, sketch);
          await build(sketch);
        }
        const id = listenerId++;
        sketch.listeners[id] = res;

        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
        });

        req.on("close", () => {
          if (!sketch) return;
          /*eslint @typescript-eslint/no-unused-vars: ["error", { "ignoreRestSiblings": true }]*/
          const { [id]: _, ...rest } = sketch.listeners;
          sketch.listeners = rest;
        });
      },
    },
    {
      method: "GET",
      path: /^\/(.+)$/,
      callback: async (
        req: http.IncomingMessage,
        res: http.ServerResponse,
        match: RegExpMatchArray
      ) => {
        const name = match[1]
          .split("/")
          .filter((x) => x)
          .join("/");
        const entryPoint = path.join(dir, name, "src", "index.js");
        try {
          await fs.stat(entryPoint);
        } catch (err) {
          res.writeHead(404, {
            "Content-Type": "text/plain",
          });
          res.end(http.STATUS_CODES[404]);
          return;
        }

        let sketch = sketchMap.get(name);
        if (!sketch) {
          sketch = {
            name,
            entryPoint,
            errors: [],
            warnings: [],
            text: null,
            listeners: {},
          };
          sketchMap.set(name, sketch);
          await build(sketch);
        }

        if (sketch.errors.length) {
          const indexPath = path.join(
            url.fileURLToPath(import.meta.url),
            "..",
            "..",
            "views",
            "sketch-error.html"
          );
          const indexTemplate = await fs.readFile(indexPath, "utf-8");

          const errors = renderErrors(sketch);

          const indexHtml = indexTemplate
            .replace(/{{\s*EVENT_URL\s*}}/, path.join("/", name, "events"))
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
          "sketch.html"
        );
        const indexTemplate = await fs.readFile(indexPath, "utf-8");

        const indexHtml = indexTemplate
          .replace(/{{\s*INDEX_JS\s*}}/, path.join("/", name, "index.js"))
          .replace(/{{\s*EVENT_URL\s*}}/, path.join("/", name, "events"));
        res.writeHead(200, {
          "Content-Type": "text/html",
        });
        res.end(indexHtml);
      },
    },
  ];

  const server = http.createServer(
    async (req: http.IncomingMessage, res: http.ServerResponse) => {
      if (!req.url) throw new Error("No request URL found");
      const url = new URL(req.url, `http://${req.headers.host}`);

      for (const route of routes) {
        if (req.method === route.method) {
          const match = url.pathname.match(route.path);
          if (match) {
            route.callback(req, res, match);
            break;
          }
        }
      }
    }
  );

  server.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
  });
}
