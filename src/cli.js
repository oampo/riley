#! /usr/bin/env node

import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

import { docopt } from "docopt";
import pkgDir from "pkg-dir";

const USAGE = `
Usage:
  riley create (sketchbook|sketch) <path>
  riley -h | --help
  riley --version
`;

function parseArgs() {
  return docopt(USAGE, {
    version: process.env.npm_package_version,
  });
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

async function createSketch(dir) {
  const templateDir = await getTemplateDir("sketch");
  await copyTemplate(templateDir, dir);
}

async function main() {
  try {
    const args = parseArgs();

    if (args.create && args.sketchbook) {
      await createSketchbook(args["<path>"]);
    }

    if (args.create && args.sketch) {
      await createSketch(args["<path>"]);
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

main();
