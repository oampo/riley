#! /usr/bin/env node

import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

import globCb from "glob";
import HtmlWebpackPlugin from "html-webpack-plugin";
import pkgDir from "pkg-dir";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server/lib/Server.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const glob = promisify(globCb);

function parseArgs() {
  return yargs(hideBin(process.argv))
    .command("create", "Create a new sketchbook or sketch", (yargs) => {
      return yargs
        .command("sketchbook <path>", "Create a new sketchbook", (yargs) => {
          return yargs
            .positional("path", {
              describe: "The path to create the sketchbook",
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
}

async function getTemplateDir(templateName) {
  const root = await pkgDir(fileURLToPath(import.meta.url));
  return path.join(root, "templates", templateName);
}

async function copyTemplate(from, to) {
  await fs.ensureDir(to);
  const files = await fs.readdir(to);
  if (files.length) {
    throw new Error(`Cannot copy to ${to}. Directory already contains files.`);
  }

  await fs.copy(from, to, {
    filter: (path) => path !== "node_modules" && path !== "package-lock.json",
  });
}

function npmInstall(dir) {
  console.log("Installing dependencies");
  const cwd = process.cwd();
  process.chdir(dir);
  execSync("npm install", { stdio: "inherit" });
  process.chdir(cwd);
}

function gitInit(dir) {
  console.log("Initialising git repository");
  try {
    execSync(`git init ${dir}`, { stdio: "inherit" });
  } catch (e) {
    console.warn("Could not initialise git repository");
  }
}

function gitCommit(dir) {
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

async function setPackageName(dir) {
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
    JSON.stringify(packageJson, "", 2) + "\n"
  );
}

async function createSketchbook(dir) {
  const templateDir = await getTemplateDir("sketchbook");
  await copyTemplate(templateDir, dir);
  await setPackageName(dir);
  gitInit(dir);
  npmInstall(dir);
  gitCommit(dir);
}

async function createSketch(dir, name) {
  const sketchDir = path.join(dir, name);
  const templateDir = await getTemplateDir("sketch");
  await copyTemplate(templateDir, sketchDir);
}

async function startDevServer(dir) {
  const sketches = await glob(path.join(dir, "**", "src", "index.js"));

  const entry = sketches.reduce((entry, sketch) => {
    const sketchSegments = path.relative(dir, sketch).split(path.sep);
    const sketchName = sketchSegments
      // Slice off src/index.js
      .slice(0, sketchSegments.length - 2)
      .join("/");
    return {
      ...entry,
      [sketchName]: `./${sketch}`,
    };
  }, {});

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
    },
    compiler
  );
  server.start();
}

async function main() {
  try {
    const args = parseArgs();

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
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

main();
