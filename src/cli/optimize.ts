import fs from "node:fs/promises";
import path from "node:path";

import { deserialize } from "../line";
import { serialize } from "../line";
import { mergeNearby, spatialSort } from "../optimize";
import { getSketch } from "./sketch";

export async function optimize(
  filePath: string,
  sketchDir: string,
  outDir: string,
): Promise<void> {
  const ext = path.extname(filePath);
  if (ext !== ".json") {
    throw new Error("Expected JSON file");
  }

  await getSketch(sketchDir);

  const text = await fs.readFile(filePath, "utf-8");
  const lines = deserialize(text);
  const optimized = mergeNearby(spatialSort(lines));
  const serialized = serialize(optimized);

  const baseName = path.basename(filePath, ext);
  await fs.mkdir(outDir, { recursive: true });
  const outputPath = path.join(outDir, `${baseName}.optimized.json`);
  await fs.writeFile(outputPath, serialized);
}
