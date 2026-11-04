import fs from "node:fs/promises";
import path from "node:path";

import { deserialize } from "../line";
import { serialize } from "../line";
import { group, mergeNearby, sort, spatialSort } from "../optimize";
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

  const { sketch } = await getSketch(sketchDir);

  const text = await fs.readFile(filePath, "utf-8");
  const lines = deserialize(text);
  const sorted = sort(lines, sketch.config.optimization);
  const grouped = group(sorted);
  const spatiallySorted = grouped.map((group) => spatialSort(group));
  const optimized = mergeNearby(spatiallySorted.flat());
  const serialized = serialize(optimized);

  const baseName = path.basename(filePath, ext);
  await fs.mkdir(outDir, { recursive: true });
  const outputPath = path.join(outDir, `${baseName}.optimized.json`);
  await fs.writeFile(outputPath, serialized);
}
