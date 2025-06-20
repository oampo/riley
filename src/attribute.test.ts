import { layer, mapVertices, pushVertices, vertices, weight } from "./attribute";
import { line } from "./line";
import { vec2 } from "./math";

describe("vertices", () => {
  it("sets and gets the layer", () => {
    let l = line();
    const value = [vec2(0, 0), vec2(1, 1)];
    l = vertices(l, value);
    expect(vertices(l)).toEqual(value);
  });
});

describe("layer", () => {
  it("sets and gets the layer", () => {
    let l = line();
    const value = 5;
    l = layer(l, value);
    expect(layer(l)).toEqual(value);
  });
});

describe("weight", () => {
  it("sets and gets the weight", () => {
    let l = line();
    const value = 5;
    l = weight(l, value);
    expect(weight(l)).toEqual(value);
  });
});

describe("mapVertices", () => {
  it("applies a function to each vertex", () => {
    let l = line(vec2(0, 0), vec2(1, 1));
    l = mapVertices(l, v => v.add(vec2(1, 0)));
    expect(vertices(l)).toEqual([vec2(1, 0), vec2(2, 1)]);
  });
});

describe("pushVertices", () => {
  it("adds new vertex to a line", () => {
    let l = line(vec2(0, 0), vec2(1, 1));
    l = pushVertices(l, vec2(2, 2), vec2(3, 3));
    expect(vertices(l)).toEqual([vec2(0, 0), vec2(1, 1), vec2(2, 2), vec2(3, 3)]);
  });
});
