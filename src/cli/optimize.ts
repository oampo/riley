import fs from "node:fs/promises";
import path from "node:path";

import { deserialize } from "../line";
import { serialize } from "../line";
import { mergeNearby, spatialSort } from "../optimize";

export async function optimize(
  filePath: string,
  outDir: string | undefined,
): Promise<void> {
  const ext = path.extname(filePath);
  if (ext !== ".json") {
    throw new Error("Expected JSON file");
  }
  const text = await fs.readFile(filePath, "utf-8");
  const lines = deserialize(text);
  const optimized = mergeNearby(spatialSort(lines));
  const serialized = serialize(optimized);

  const fileDir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const outputDir = outDir ?? fileDir;
  const outputPath = path.join(outputDir, `${baseName}.optimized.json`);
  await fs.writeFile(outputPath, serialized);
}
