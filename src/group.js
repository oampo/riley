import { vec2 } from "gl-matrix";

export function group(groups) {
  return {
    ...groups[0],
    lines: groups.flatMap((group) =>
      group.lines.map((vertices) =>
        vertices.map((vertex) => vec2.clone(vertex))
      )
    ),
  };
}
