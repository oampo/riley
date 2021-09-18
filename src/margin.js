import { vec2 } from "./math";
import { translate } from "./transform";

export function withMargin(size, margin, cb) {
  let innerSize, translation;
  if (typeof margin === "number") {
    innerSize = size.sub(vec2(margin * 2, margin * 2));
    translation = vec2(margin, margin);
  } else {
    innerSize = size.sub(
      vec2(margin.left + margin.right),
      vec2(margin.top + margin.bottom)
    );
    translation = vec2(margin.left, margin.top);
  }

  return cb({ size: innerSize }).map((l) => translate(l, translation));
}
