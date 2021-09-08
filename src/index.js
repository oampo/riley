import config from "./config";
import { weight } from "./attribute";
import { color } from "./color";
import { hex } from "./data";
import { vec2 } from "./math";
import { spatialSort, mergeNearby } from "./optimize";

// Re-export submodules
export * from "./attribute";
export * from "./clip-mask";
export * from "./color";
export * from "./geometry";
export * from "./hatch";
export * from "./math";
export * from "./optimize";
export * from "./polygon-ops";
export * from "./shape";
export * from "./transform";

const paperSizes = {
  A0: vec2(841, 1189),
  A1: vec2(594, 841),
  A2: vec2(420, 594),
  A3: vec2(297, 420),
  A4: vec2(210, 297),
  A5: vec2(148, 210),
  A6: vec2(105, 148),
  A7: vec2(74, 105),
  A8: vec2(52, 74),
  A9: vec2(37, 52),
  A10: vec2(26, 37),
};

let lastUpdateTime;
let playing = false;

function tick(draw, update, svg, config) {
  if (!playing) {
    return;
  }

  const { timestep } = config;
  const time = Date.now();
  while (time - lastUpdateTime > timestep * 1000) {
    update(timestep, config);
    lastUpdateTime += timestep * 1000;
  }

  const lines = draw(config);
  renderLines(svg, lines);

  requestAnimationFrame(() => tick(draw, update, svg, config));
}

function play(draw, update, svg, config) {
  if (!update) {
    throw new Error("Must have an update listener to play");
  }
  playing = true;
  lastUpdateTime = Date.now();
  requestAnimationFrame(() => tick(draw, update, svg, config));
}

function pause() {
  playing = false;
}

function getPaperSize(size, orientation) {
  if (typeof size === "string" || size instanceof String) {
    if (!(size in paperSizes)) {
      throw new Error(`Unknown paper size: ${size}`);
    }
    size = paperSizes[size];
  }

  if (orientation === "landscape") {
    size = vec2(size.y, size.x);
  }

  return size;
}

function setSvgSize(svg, size) {
  const { x: width, y: height } = size;

  svg.setAttribute("data-width", `${width}`);
  svg.setAttribute("data-height", `${height}`);
  svg.setAttribute("width", `${width}mm`);
  svg.setAttribute("height", `${height}mm`);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
}

function renderLines(svg, lines) {
  if (!Array.isArray(lines)) {
    lines = [lines];
  }

  lines = spatialSort(lines);
  lines = mergeNearby(lines);

  const elements = [];
  for (const line of lines) {
    const { vertices } = line;
    const element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline"
    );
    const points = vertices
      .map((vertex) => `${vertex.x},${vertex.y}`)
      .join(" ");
    element.setAttribute("points", points);
    element.setAttribute("fill", "none");
    element.setAttribute("stroke", `#${hex(color(line))}`);
    element.setAttribute("stroke-width", weight(line));
    element.setAttribute("stroke-linecap", "round");

    elements.push(element);
  }

  svg.replaceChildren(...elements);
}

export default function riley(listeners, options) {
  const { draw, update } = listeners;
  if (!draw) {
    throw new Error("Must have a draw listener");
  }

  Object.assign(config, options);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const paperSize = getPaperSize(config.paperSize, config.paperOrientation);
  setSvgSize(svg, paperSize);
  config.size = paperSize;
  svg.style.backgroundColor = `#${hex(config.backgroundColor)}`;

  const lines = draw(config);
  renderLines(svg, lines);

  if (listeners.update && config.autoplay) {
    play(draw, update, svg, config);
  }

  return {
    getElement() {
      return svg;
    },
    play() {
      play(draw, update, svg, config);
    },
    pause,
  };
}
