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
  await plotter.disconnect();
}

export async function penUp(sketchDir: string): Promise<void> {
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
  await plotter.penUp();
  await plotter.disconnect();
}

export async function penDown(sketchDir: string): Promise<void> {
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
  await plotter.penDown();
  await plotter.disconnect();
}

export async function move(
  sketchDir: string,
  x: number,
  y: number,
): Promise<void> {
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
  await plotter.penUp();
  await plotter.move(x, y);
  await plotter.disconnect();
}

export async function sleep(sketchDir: string): Promise<void> {
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
  await plotter.sleep();
  await plotter.disconnect();
}
