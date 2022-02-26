#! /usr/bin/env node

import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

import express from "express";
import globCb from "glob";
import HtmlWebpackPlugin from "html-webpack-plugin";
import pkgDir from "pkg-dir";
import sanitizeFilename from "sanitize-filename";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const glob = promisify(globCb);

function parseArgs() {
  const args = yargs(hideBin(process.argv))
    .command("create", "Create a new sketchbook or sketch", (yargs) => {
      return yargs
        .command("sketchbook <path>", "Create a new sketchbook", (yargs) => {
          return yargs
            .positional("path", {
              describe: "The path to create the sketchbook",
              type: "string",
            })
            .demandOption("path");
        })
        .command(
          "sketch <name> [-d <directory>]",
          "Create a new sketch",
          (yargs) => {
            return yargs
              .positional("name", {
                describe: "The name of the sketch",
                type: "string",
              })
              .option("directory", {
                alias: "d",
                describe: "The directory which should contain the sketch",
                default: "./",
              })
              .demandOption("name");
          }
        )
        .version(false)
        .demandCommand();
    })
    .command("start", "Start developing a sketch", (yargs) => {
      return yargs
        .option("directory", {
          alias: "d",
          describe: "The directory which contains the sketch",
          default: "./",
        })
        .version(false);
    })
    .demandCommand()
    .strict()
    .help().argv;

  return Promise.resolve(args);
}

async function getTemplateDir(templateName: string): Promise<string> {
  const root = await pkgDir(fileURLToPath(import.meta.url));
  if (!root) throw new Error("Could not find package directory");
  return path.join(root, "templates", templateName);
}

async function copyTemplate(from: string, to: string): Promise<void> {
  await fs.ensureDir(to);
  const files = await fs.readdir(to);
  if (files.length) {
    throw new Error(`Cannot copy to ${to}. Directory already contains files.`);
  }

  await fs.copy(from, to, {
    filter: (path) => path !== "node_modules" && path !== "package-lock.json",
  });
}

function npmInstall(dir: string): void {
  console.log("Installing dependencies");
  const cwd = process.cwd();
  process.chdir(dir);
  execSync("npm install", { stdio: "inherit" });
  process.chdir(cwd);
}

function gitInit(dir: string): void {
  console.log("Initialising git repository");
  try {
    execSync(`git init ${dir}`, { stdio: "inherit" });
  } catch (e) {
    console.warn("Could not initialise git repository");
  }
}

function gitCommit(dir: string): void {
  const cwd = process.cwd();
  process.chdir(dir);
  try {
    execSync(`git add -A`, { stdio: "inherit" });
    execSync(`git commit -m "Initial commit from Riley"`, { stdio: "inherit" });
  } catch (e) {
    console.warn("Could not create initial git commit");
  } finally {
    process.chdir(cwd);
  }
}

async function setPackageName(dir: string): Promise<void> {
  const packageJsonPath = path.join(dir, "package.json");
  const data = await fs.readFile(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(data);
  const baseName = path.parse(dir).base;
  packageJson.name = baseName
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");
  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(packageJson, undefined, 2) + "\n"
  );
}

async function createSketchbook(dir: string): Promise<void> {
  const templateDir = await getTemplateDir("sketchbook");
  await copyTemplate(templateDir, dir);
  await setPackageName(dir);
  gitInit(dir);
  npmInstall(dir);
  gitCommit(dir);
}

async function createSketch(dir: string, name: string): Promise<void> {
  const sketchDir = path.join(dir, name);
  const templateDir = await getTemplateDir("sketch");
  await copyTemplate(templateDir, sketchDir);
}

function isSubpath(dirA: string, dirB: string): boolean {
  const relative = path.relative(dirA, dirB);
  return relative
    ? !relative.startsWith("..") && !path.isAbsolute(relative)
    : false;
}

async function startDevServer(dir: string): Promise<void> {
  const sketches = await glob(path.join(dir, "**", "src", "index.js"));

  const entry = sketches.reduce(
    (entry: { [name: string]: string }, sketch: string) => {
      const sketchSegments = path.relative(dir, sketch).split(path.sep);
      const sketchName = sketchSegments
        // Slice off src/index.js
        .slice(0, sketchSegments.length - 2)
        .join("/");
      return {
        ...entry,
        [sketchName]: `./${sketch}`,
      };
    },
    {}
  );

  const template = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "views",
    "sketch.html"
  );

  const htmlPlugins = Object.keys(entry).map(
    (entry) =>
      new HtmlWebpackPlugin({
        title: `Riley sketchbook | ${entry}`,
        chunks: [entry],
        filename: `${entry}/index.html`,
        template,
        inject: false,
        scriptLoading: "blocking",
      })
  );

  const compiler = webpack({
    mode: "development",
    entry,
    output: {
      path: path.resolve("build"),
      filename: "[name]/index.js",
      library: "sketch",
    },
    module: {
      rules: [
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
    stats: "errors-warnings",
    plugins: [
      ...htmlPlugins,
      // Work around stupid webpack issue:
      // https://github.com/webpack/webpack/issues/5756
      // Make rbush-knn import the compiled version of tinyqueue
      new webpack.NormalModuleReplacementPlugin(/tinyqueue/, (resource) => {
        if (!/rbush-knn/.test(resource.context)) {
          return;
        }

        resource.request = "tinyqueue/tinyqueue.js";
      }),
    ],
  });
  const server = new WebpackDevServer(
    {
      port: 3000,
      static: false,
      setupMiddlewares: (middlewares, devServer) => {
        const { app } = devServer;
        if (!app) throw new Error("No dev server app instance");
        app.use(express.json());
        app.post("/api/export", async function (req, res) {
          const { sketch, seed, frameCount, content } = req.body;
          const exportDir = path.join(dir, sketch, "export");
          if (!isSubpath(dir, exportDir)) {
            return res.status(400).json({
              message: "Export directory must be subpath of sketch directory",
            });
          }
          const fileName = sanitizeFilename(`frame.${seed}.${frameCount}.svg`);
          await fs.ensureDir(exportDir);
          await fs.writeFile(path.join(exportDir, fileName), content);
          res.status(201).json({});
        });
        return middlewares;
      },
    },
    compiler
  );
  server.start();
}

async function main(): Promise<void> {
  try {
    const args = await parseArgs();

    const command = args._[0];

    switch (command) {
      case "create": {
        const command = args._[1];
        switch (command) {
          case "sketchbook":
            await createSketchbook(args.path);
            break;
          case "sketch":
            await createSketch(args.directory, args.name);
            break;
        }
        break;
      }
      case "start":
        startDevServer(args.directory);
        break;
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(`Error: ${e.message}`);
    }
    process.exit(1);
  }
}

main();
