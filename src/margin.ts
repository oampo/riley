import type { Line } from "./line";
import { vec2, Vec2 } from "./math";
import { translate } from "./transform";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type WithMarginCallback = ({ size }: { size: Vec2 }) => [Line];

export function withMargin(
  size: Vec2,
  margin: number | Margin,
  cb: WithMarginCallback
) {
  let innerSize: Vec2, translation: Vec2;
  if (typeof margin === "number") {
    innerSize = size.sub(vec2(margin * 2, margin * 2));
    translation = vec2(margin, margin);
  } else {
    innerSize = size.sub(
      vec2(margin.left + margin.right, margin.top + margin.bottom)
    );
    translation = vec2(margin.left, margin.top);
  }

  return cb({ size: innerSize }).map((l) => translate(l, translation));
}
