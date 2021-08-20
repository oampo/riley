import config from "./config";

// Re-export libraries under our namespace
export * from "gl-matrix";
// Re-export submodules
export * from "./shape";

let lastUpdateTime;
let playing = false;

function tick(draw, update, svg) {
  if (!playing) {
    return;
  }

  const { timestep } = config;
  const time = Date.now();
  while (time - lastUpdateTime > timestep * 1000) {
    update(timestep);
    lastUpdateTime += timestep * 1000;
  }

  const lines = draw();
  renderLines(svg, lines);

  requestAnimationFrame(() => tick(draw, update, svg));
}

function play(draw, update, svg) {
  if (!update) {
    throw new Error("Must have an update listener to play");
  }
  playing = true;
  lastUpdateTime = Date.now();
  requestAnimationFrame(() => tick(draw, update, svg));
}

function pause() {
  playing = false;
}

function setPaperSize(svg, size, orientation) {
  if (typeof size === "string" || size instanceof String) {
    if (!(size in paperSizes)) {
      throw new Error(`Unknown paper size: ${size}`);
    }
    size = paperSizes[size];
  }

  if (orientation === "landscape") {
    size = vec2.fromValues(size[1], size[0]);
  }

  const [width, height] = size;

  svg.setAttribute("data-width", `${width}`);
  svg.setAttribute("data-height", `${height}`);
  svg.setAttribute("width", `${width}mm`);
  svg.setAttribute("height", `${height}mm`);
  svg.setAttribute("viewbox", `0 0 ${width} ${height}`);
}

function renderLines(svg, lines) {}

export default function riley(listeners, options) {
  const { draw, update } = listeners;
  if (!draw) {
    throw new Error("Must have a draw listener");
  }

  Object.assign(config, options);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  const lines = draw();
  renderLines(svg, lines);

  if (listeners.update && config.autoplay) {
    play(draw, update);
  }

  return {
    getElement() {
      return svg;
    },
    play() {
      play(draw, update, svg);
    },
    pause,
  };
}
