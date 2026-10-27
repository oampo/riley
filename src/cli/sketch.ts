import type { Sketch } from "../sketch";
import { BuildResultType, compiler } from "./compiler";

type GetSketchResult = { sketch: Sketch; hash: string };

export async function getSketch(sketchDir: string): Promise<GetSketchResult> {
  const comp = compiler();
  const result = await comp.build(sketchDir);
  if (result.type !== BuildResultType.SUCCESS) {
    throw new Error("Build failed");
  }

  const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(result.text)}`;
  const { default: sketch } = (await import(dataUrl)) as { default: Sketch };

  const hash = fnv1a32(result.text);
  return { sketch, hash };
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
