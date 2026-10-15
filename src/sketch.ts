import { layer, weight } from "./attribute";
import { checkExists } from "./base";
import { alpha, color, rgbaHex, rgbHex } from "./color";
import type { Config } from "./config";
import { getConfig, setConfig } from "./config";
import type { Line } from "./line";
import type { Vec2 } from "./math/vec2";
import { noiseSeed } from "./noise";
import { mergeNearby, spatialSort } from "./optimize";
import { randomSeed } from "./random";

export interface Sketch {
  getElement(): SVGSVGElement;
  play(): void;
  pause(): void;
  requestExport(): void;
}

type SetupFn = (config: Config) => void;
type DrawFn = (config: Config) => Line | Line[];
type UpdateFn = (timestep: number, config: Config) => void;

interface Listeners {
  setup?: SetupFn;
  draw: DrawFn;
  update?: UpdateFn;
}

class SketchImpl implements Sketch {
  private readonly svg: SVGSVGElement;
  private readonly config: Config;
  private shouldExport: boolean = false;
  private playing: boolean = false;
  private frameCount: number = 0;
  private lastUpdateTime: number = Date.now();

  constructor(
    private readonly listeners: Listeners,
    options: Partial<Config> | undefined,
  ) {
    if (options) {
      setConfig(options);
    }

    this.config = getConfig();

    randomSeed(this.config.seed);
    noiseSeed();

    this.svg = this.createSvg();

    if (listeners.update && this.config.autoplay) {
      this.start();
    } else {
      requestAnimationFrame(() => this.render());
    }
  }

  getElement(): SVGSVGElement {
    return this.svg;
  }

  play(): void {}

  pause(): void {
    this.playing = false;
  }

  requestExport(): void {
    this.shouldExport = true;
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

  private start(): void {
    if (!this.listeners.update) {
      throw new Error("Must have an update listener to play");
    }
    this.playing = true;
    this.lastUpdateTime = Date.now();
    requestAnimationFrame(() => this.tick());
  }

  private tick(): void {
    if (!this.playing) {
      return;
    }

    const { timestep } = this.config;
    const time = Date.now();
    while (time - this.lastUpdateTime > timestep * 1000) {
      checkExists(this.listeners.update)(timestep, this.config);
      this.lastUpdateTime += timestep * 1000;
    }

    this.render();
    this.frameCount += 1;

    requestAnimationFrame(() => this.tick());
  }

  private render(): void {
    const lines = this.listeners.draw(this.config);
    this.renderLines(lines, this.shouldExport);

    if (this.shouldExport) {
      const svgText = this.svg.outerHTML;
      void fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: svgText,
          sketch: window.location.pathname
            .slice(1)
            .replace(/(\/(index.html)?)?$/, ""),
          frameCount: this.frameCount,
          seed: this.config.seed,
        }),
      });
    }

    this.shouldExport = false;
  }

  private renderLines(lines: Line | Line[], optimize = false): void {
    if (!Array.isArray(lines)) {
      lines = [lines];
    }

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
      const [layerId] = entry;
      let [, lines] = entry;

      if (optimize) {
        lines = spatialSort(lines);
        lines = mergeNearby(lines);
      }

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

export function sketch(
  listeners: Listeners,
  options?: Partial<Config>,
): Sketch {
  return new SketchImpl(listeners, options);
}
