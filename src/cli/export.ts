import fs from "node:fs/promises";
import path from "node:path";

import { serialize } from "../line";
import { getSketch } from "./sketch";

export async function exportSketch(
  sketchDir: string,
  outDir: string,
): Promise<void> {
  const { sketch, hash } = await getSketch(sketchDir);
  const serialized = serialize(sketch.export());

  const seed = sketch.config.seed;
  const date = new Date().toISOString().split("T")[0];
  const filename = `${date}-${hash}-${seed}.json`;

  const filePath = path.join(outDir, filename);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(filePath, serialized);
}
