import { alpha, blue, color, green, red }  from "./color";
import { line } from "./line";
import { vec4 } from "./math";

describe("color", () => {
  it("gets and sets the color", () => {
    let l = line();
    const value = vec4(1, 1, 1, 1);
    l = color(l, value);
    expect(color(l)).toEqual(value);
  });
});

describe("red", () => {
  it("gets and sets the red", () => {
    let l = line();
    l = red(l, 1);
    expect(red(l)).toEqual(1);
    expect(color(l)).toEqual(vec4(1, 0, 0, 1));
  });
});

describe("green", () => {
  it("gets and sets the green", () => {
    let l = line();
    l = green(l, 1);
    expect(green(l)).toEqual(1);
    expect(color(l)).toEqual(vec4(0, 1, 0, 1));
  });
});

describe("blue", () => {
  it("gets and sets the blue", () => {
    let l = line();
    l = blue(l, 1);
    expect(blue(l)).toEqual(1);
    expect(color(l)).toEqual(vec4(0, 0, 1, 1));
  });
});

describe("alpha", () => {
  it("gets and sets the alpha", () => {
    let l = line();
    l = alpha(l, 0);
    expect(alpha(l)).toEqual(0);
    expect(color(l)).toEqual(vec4(0, 0, 0, 0));
  });
});
