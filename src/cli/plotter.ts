import { checkExists } from "../base";
import { getPlotter } from "../plotter";
import { getSketch } from "./sketch";

export async function home(sketchDir: string): Promise<void> {
  const { sketch } = await getSketch(sketchDir);
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
