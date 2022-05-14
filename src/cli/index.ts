#! /usr/bin/env node

import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { parseArgs } from "./arg-parser.js";
import startDevServer from "./dev-server.js";
import {
  help,
  startHelp,
  createHelp,
  createSketchbookHelp,
  createSketchHelp,
} from "./help.js";
import { VERSION } from "../version.js";

const argSpec = {
  commands: [
    {
      name: "create",
      spec: {
        commands: [
          {
            name: "sketchbook",
            spec: {
              args: [
                {
                  name: "directory",
                  type: "string",
                  required: true,
                },
              ] as const,
              help: createSketchbookHelp,
            },
          },
          {
            name: "sketch",
            spec: {
              args: [
                {
                  name: "name",
                  type: "string",
                  required: true,
                },
              ] as const,
              flags: [
                {
                  name: "directory",
                  alias: "d",
                  type: "string",
                  default: "./",
                },
              ] as const,
              help: createSketchHelp,
            },
          },
        ] as const,
        help: createHelp,
      },
    },
    {
      name: "start",
      spec: {
        flags: [
          {
            name: "directory",
            type: "string",
            alias: "d",
            default: "./",
          },
        ] as const,
        help: startHelp,
      },
    },
  ] as const,
  help: help,
  version: VERSION,
};

async function pkgDir(dir: string): Promise<string | undefined> {
  dir = path.resolve(dir);
  try {
    const stat = await fs.lstat(path.join(dir, "package.json"));
    if (stat.isFile()) return dir;
  } catch (err) {
    // Wasn't a file, so keep searching upwards
  }

  const parent = path.dirname(dir);
  if (path.relative(parent, dir) === "") {
    // It's the root directory, and we haven't found it
    return undefined;
  }

  return pkgDir(parent);
}

async function getTemplateDir(templateName: string): Promise<string> {
  const root = await pkgDir(fileURLToPath(import.meta.url));
  if (!root) throw new Error("Could not find package directory");
  return path.join(root, "templates", templateName);
}

async function copyTemplate(from: string, to: string): Promise<void> {
  try {
    await fs.mkdir(to, { recursive: true });
  } catch (err) {
    throw new Error(`Could not create directory ${to}`);
  }
  const files = await fs.readdir(to);
  if (files.length) {
    throw new Error(`Cannot copy to ${to}. Directory already contains files.`);
  }

  await fs.cp(from, to, {
    filter: (p) => {
      const basename = path.basename(p);
      return basename !== "node_modules" && basename !== "package-lock.json";
    },
    recursive: true,
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
    const { command } = parseArgs<typeof argSpec>(
      process.argv.slice(2),
      argSpec
    );

    switch (command.name) {
      case "create": {
        const { command: subcommand } = command;

        switch (subcommand.name) {
          case "sketchbook": {
            const { args } = subcommand;
            const { directory } = args;
            await createSketchbook(directory);
            break;
          }
          case "sketch": {
            const { name } = subcommand.args;
            const { directory } = subcommand.flags;
            await createSketch(directory, name);
            break;
          }
        }
        break;
      }
      case "start": {
        const { flags } = command;
        await startDevServer(flags.directory);
        break;
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(`Error: ${e.message}`);
    }
    process.exit(1);
  }
}

main();
