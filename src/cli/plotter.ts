import { checkExists } from "../base";
import { getPlotter } from "../plotter";
import type { Sketch } from "../sketch";
import { BuildResultType, compiler } from "./compiler";

export async function home(sketchDir: string): Promise<void> {
  const comp = compiler();
  const result = await comp.build(sketchDir);
  if (result.type !== BuildResultType.SUCCESS) {
    throw new Error("Build failed when exporting sketch");
  }

  const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(result.text)}`;
  const { default: sketch } = (await import(dataUrl)) as { default: Sketch };
  const plotterConfig = checkExists(
    sketch.config.plotter,
    "No plotter configured",
  );
  const plotter = checkExists(
    await getPlotter(plotterConfig),
    "Could not find plotter",
  );
  await plotter.connect();
  await plotter.home();
  await plotter.sleep();
  await plotter.disconnect();
}
