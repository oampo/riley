#! /usr/bin/env node

import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

import pkgDir from "pkg-dir";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import startDevServer from "./dev-server.js";

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
        await startDevServer(args.directory);
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
