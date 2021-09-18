import config from "./config";
import { layer, weight } from "./attribute";
import { color, alpha } from "./color";
import { hex, rgbHex } from "./data";
import { vec2 } from "./math";
import { noiseSeed } from "./noise";
import { spatialSort, mergeNearby } from "./optimize";
import { randomSeed } from "./random";

// Re-export submodules
export * from "./attribute";
export * from "./clip-mask";
export * from "./color";
export * from "./geometry";
export * from "./hatch";
export * from "./line-ops";
export * from "./margin";
export * from "./math";
export * from "./noise";
export * from "./optimize";
export * from "./polygon-ops";
export * from "./random";
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
let frameCount = 0;
let shouldExport = false;

function requestExport() {
  shouldExport = true;
}

function render(svg, draw, config) {
  const lines = draw(config);
  renderLines(svg, lines, shouldExport);

  if (shouldExport) {
    const svgText = svg.outerHTML;
    fetch("/api/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: svgText,
        sketch: window.location.pathname
          .slice(1)
          .replace(/(\/(index.html)?)?$/, ""),
        frameCount,
        seed: config.seed,
      }),
    });
  }

  shouldExport = false;
}

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

  render(svg, draw, config);
  frameCount += 1;

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

function createSvg(paperSize, backgroundColor) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  setSvgSize(svg, paperSize);
  svg.style.backgroundColor = `#${hex(backgroundColor)}`;
  return svg;
}

function renderLines(svg, lines, optimize = false) {
  if (!Array.isArray(lines)) {
    lines = [lines];
  }

  if (!lines.length) {
    svg.replaceChildren();
  }

  lines.sort((a, b) => layer(a) - layer(b));

  const layerIds = [];
  const linesByLayerId = {};
  for (const line of lines) {
    const layerId = layer(line);
    if (!(layerId in linesByLayerId)) {
      layerIds.push(layerId);
      linesByLayerId[layerId] = [line];
      continue;
    }

    linesByLayerId[layerId].push(line);
  }

  const layers = [];
  for (const layerId of layerIds) {
    let lines = linesByLayerId[layerId];
    if (optimize) {
      lines = spatialSort(lines);
      lines = mergeNearby(lines);
    }

    const layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    layer.setAttributeNS("http://www.w3.org/2000/svg", "id", layerId);
    layer.setAttributeNS(
      "http://www.inkscape.org/namespaces/inkscape",
      "inkscape:groupmode",
      "layer"
    );
    layer.setAttributeNS(
      "http://www.inkscape.org/namespaces/inkscape",
      "inkscape:label",
      layerId
    );

    for (const line of lines) {
      const { vertices } = line;
      const element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline"
      );
      const points = vertices
        .map((vertex) =>
          optimize
            ? `${vertex.x.toFixed(3)},${vertex.y.toFixed(3)}`
            : `${vertex.x},${vertex.y}`
        )
        .join(" ");
      element.setAttribute("points", points);
      element.setAttribute("fill", "none");
      element.setAttribute("stroke", `#${rgbHex(color(line))}`);
      element.setAttribute(
        "stroke-opacity",
        optimize ? alpha(line).toFixed(3) : alpha(line)
      );
      element.setAttribute("stroke-width", weight(line));
      element.setAttribute("stroke-linecap", "round");

      layer.appendChild(element);
    }

    layers.push(layer);
  }

  svg.replaceChildren(...layers);
}

export default function riley(listeners, options) {
  const { draw, update } = listeners;
  if (!draw) {
    throw new Error("Must have a draw listener");
  }

  Object.assign(config, options);

  randomSeed(config.seed);
  noiseSeed(config.seed);

  const paperSize = getPaperSize(config.paperSize, config.paperOrientation);
  config.size = paperSize;

  const svg = createSvg(paperSize, config.backgroundColor);

  if (listeners.update && config.autoplay) {
    play(draw, update, svg, config);
  } else {
    requestAnimationFrame(() => render(svg, draw, config));
  }

  return {
    getElement() {
      return svg;
    },
    play() {
      play(draw, update, svg, config);
    },
    pause,
    requestExport,
  };
}
