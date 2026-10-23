import fs from "node:fs/promises";
import path from "node:path";

import { serialize } from "../line";
import type { Sketch } from "../sketch";
import { BuildResultType, compiler } from "./compiler";

export async function exportSketch(sketchDir: string): Promise<void> {
  const comp = compiler();
  const result = await comp.build(sketchDir);
  if (result.type !== BuildResultType.SUCCESS) {
    throw new Error("Build failed when exporting sketch");
  }

  const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(result.text)}`;
  const { default: sketch } = (await import(dataUrl)) as { default: Sketch };
  const serialized = serialize(sketch.export());

  const hash = fnv1a32(result.text);
  const seed = sketch.config.seed;
  const date = new Date().toISOString().split("T")[0];
  const filename = `${date}-${hash}-${seed}.json`;

  const outputDir = path.join(sketchDir, "output");
  const filePath = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, serialized);
}

// FNV-1a hasing algorithm - 32 bits
function fnv1a32(input: string): string {
  const bytes = Buffer.from(input, "utf8");
  let hash = 0x811c9dc5;
  for (const b of bytes) {
    hash ^= b;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}
