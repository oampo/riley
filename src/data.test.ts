import { hex, rgbHex } from "./data";
import { vec4 } from "./math";

describe("hex", () => {
  it("converts rgba to hex", () => {
    expect(hex(vec4(0, 0.25, 0.5, 0.75))).toEqual("003f7fbf");
  });
});

describe("rgbHex", () => {
  it("converts rgb to hex, ignoring the alpha channel", () => {
    expect(rgbHex(vec4(0, 0.25, 0.5, 0.75))).toEqual("003f7f");
  });
});
