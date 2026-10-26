import fs from "node:fs/promises";
import path from "node:path";

import { deserialize } from "../line";
import { serialize } from "../line";
import { mergeNearby, spatialSort } from "../optimize";
import { BuildResultType, compiler } from "./compiler";

export async function optimize(
  filePath: string,
  sketchDir: string,
  outDir: string,
): Promise<void> {
  const ext = path.extname(filePath);
  if (ext !== ".json") {
    throw new Error("Expected JSON file");
  }

  const comp = compiler();
  const result = await comp.build(sketchDir);
  if (result.type !== BuildResultType.SUCCESS) {
    throw new Error("Build failed when optimizing sketch");
  }

  const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(result.text)}`;
  await import(dataUrl);

  const text = await fs.readFile(filePath, "utf-8");
  const lines = deserialize(text);
  const optimized = mergeNearby(spatialSort(lines));
  const serialized = serialize(optimized);

  const baseName = path.basename(filePath, ext);
  await fs.mkdir(outDir, { recursive: true });
  const outputPath = path.join(outDir, `${baseName}.optimized.json`);
  await fs.writeFile(outputPath, serialized);
}
