export default function riley(listeners, options) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  return {
    getElement() {
      return svg;
    },
  };
}
