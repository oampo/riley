import { layer, weight } from "./attribute";
import { checkExists } from "./base";
import { alpha, color, rgbaHex, rgbHex } from "./color";
import type { Config } from "./config";
import { getConfig, setConfig } from "./config";
import type { Line } from "./line";
import type { Vec2 } from "./math/vec2";
import { noiseSeed } from "./noise";
import { randomSeed } from "./random";

export interface Sketch {
  getElement(): SVGSVGElement;
  run(): void;
  export(): Line[];
}

type SetupFn<T> = (opts: SetupOpts) => T;
type SetupOpts = {
  config: Config;
};
type UpdateFn<T> = (opts: UpdateOpts<T>) => T | undefined;
type UpdateOpts<T> = {
  state: T;
  config: Config;
};
type DrawFn<T> = (opts: DrawOpts<T>) => Line[];
type DrawOpts<T> = {
  state: T;
  config: Config;
};

type StaticListeners = {
  draw: DrawFn<void>;
};
type AnimatedListeners<T> = {
  setup: SetupFn<T>;
  update: UpdateFn<T>;
  draw: DrawFn<T>;
};
type Listeners<T> = StaticListeners | AnimatedListeners<T>;

class SketchImpl<T> implements Sketch {
  private readonly svg: SVGSVGElement;
  private readonly config: Config;
  private playing: boolean = false;
  private lastUpdateTime: number = Date.now();
  private state: T | undefined;

  constructor(
    private readonly listeners: Listeners<T>,
    config: Partial<Config> | undefined,
  ) {
    if (config) {
      setConfig(config);
    }

    this.config = getConfig();

    randomSeed(this.config.seed);
    noiseSeed();

    this.svg = this.createSvg();
  }

  getElement(): SVGSVGElement {
    return this.svg;
  }

  private createSvg(): SVGSVGElement {
    const { x: width, y: height } = this.config.size;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("data-width", `${width}`);
    svg.setAttribute("data-height", `${height}`);
    svg.setAttribute("width", `${width}mm`);
    svg.setAttribute("height", `${height}mm`);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.backgroundColor = `#${rgbaHex(this.config.backgroundColor)}`;
    return svg;
  }

  private get animatedListeners(): AnimatedListeners<T> | undefined {
    if ("update" in this.listeners) {
      return this.listeners;
    }
  }

  private get staticListeners(): StaticListeners | undefined {
    if (!("update" in this.listeners)) {
      return this.listeners;
    }
  }

  run(): void {
    if (this.animatedListeners) {
      this.state = this.animatedListeners.setup({ config: this.config });
      this.render();
      this.playing = true;
      this.lastUpdateTime = Date.now();
      requestAnimationFrame(() => this.tick());
    } else {
      this.render();
    }
  }

  private tick(): void {
    const { playing, lastUpdateTime, config } = this;
    if (!playing) {
      return;
    }

    const listeners = checkExists(this.animatedListeners);
    const { timestep } = config;
    const time = Date.now();
    while (time - lastUpdateTime > timestep * 1000) {
      const newState = listeners.update({
        config,
        state: checkExists(this.state),
      });
      if (newState == null) {
        this.playing = false;
      }
      this.state = newState;
      this.lastUpdateTime += timestep * 1000;
    }

    this.render();

    requestAnimationFrame(() => this.tick());
  }

  export(): Line[] {
    const { config, animatedListeners } = this;
    let lines: Line[] | undefined;
    if (animatedListeners) {
      this.state = animatedListeners.setup({ config });
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const newState = animatedListeners.update({
          config,
          state: checkExists(this.state),
        });
        if (newState == null) {
          break;
        }
        this.state = newState;
      }
      lines = this.generateLines();
    } else {
      lines = this.generateLines();
    }

    return checkExists(lines);
  }

  private render(): void {
    const lines = this.generateLines();
    this.renderLines(lines);
  }

  private generateLines(): Line[] {
    const { config, animatedListeners, staticListeners, state } = this;
    let lines: Line[] | undefined;
    if (animatedListeners) {
      lines = animatedListeners.draw({ config, state: checkExists(state) });
    } else if (staticListeners) {
      lines = staticListeners.draw({ config, state: undefined });
    }
    return checkExists(lines);
  }

  private renderLines(lines: Line[], optimize = false): void {
    if (!lines.length) {
      this.svg.replaceChildren();
    }

    lines.sort((a, b) => layer(a) - layer(b));

    const linesByLayerId = new Map<number, Line[]>();
    for (const line of lines) {
      const layerId = layer(line);
      if (!linesByLayerId.has(layerId)) {
        linesByLayerId.set(layerId, [line]);
        continue;
      }

      linesByLayerId.get(layerId)?.push(line);
    }

    const layers: SVGGElement[] = [];
    for (const entry of linesByLayerId.entries()) {
      const [layerId, lines] = entry;

      const layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      layer.setAttributeNS(
        "http://www.w3.org/2000/svg",
        "id",
        layerId.toString(),
      );
      layer.setAttributeNS(
        "http://www.inkscape.org/namespaces/inkscape",
        "inkscape:groupmode",
        "layer",
      );
      layer.setAttributeNS(
        "http://www.inkscape.org/namespaces/inkscape",
        "inkscape:label",
        layerId.toString(),
      );

      for (const line of lines) {
        const { vertices } = line;
        const element = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polyline",
        );
        const points = vertices
          .map((vertex: Vec2) =>
            optimize
              ? `${vertex.x.toFixed(3)},${vertex.y.toFixed(3)}`
              : `${vertex.x},${vertex.y}`,
          )
          .join(" ");
        element.setAttribute("points", points);
        element.setAttribute("fill", "none");
        element.setAttribute("stroke", `#${rgbHex(color(line))}`);
        element.setAttribute(
          "stroke-opacity",
          optimize ? alpha(line).toFixed(3) : alpha(line).toString(),
        );
        element.setAttribute(
          "stroke-width",
          optimize ? weight(line).toFixed(3) : weight(line).toString(),
        );
        element.setAttribute("stroke-linecap", "round");

        layer.appendChild(element);
      }

      layers.push(layer);
    }

    this.svg.replaceChildren(...layers);
  }
}

export function sketch<T>(
  listeners: Listeners<T>,
  options?: Partial<Config>,
): Sketch {
  return new SketchImpl(listeners, options);
}
