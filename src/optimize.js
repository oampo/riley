import { vec2 } from "gl-matrix";
import RBush from "rbush";
import knn from "rbush-knn";

import config from "./config";

export function spatialSort(lines) {
  if (lines.length <= 1) {
    return lines;
  }

  const tree = new RBush();

  const nodes = [];
  // We'll draw the first line first, so only need to add the remaining lines
  // to the tree
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.vertices.length) {
      continue;
    }

    // Insert start and end points into the tree
    const start = line.vertices[0];
    const end = line.vertices[line.vertices.length - 1];

    const startNode = {
      minX: start[0],
      minY: start[1],
      maxX: start[0],
      maxY: start[1],
      index: i,
      isEnd: false,
    };

    const endNode = {
      minX: end[0],
      minY: end[1],
      maxX: end[0],
      maxY: end[1],
      index: i,
      isEnd: true,
    };

    // Each node stores a reference to it's partner, so they can both be easily
    // removed
    startNode.partner = endNode;
    endNode.partner = startNode;

    nodes.push(startNode, endNode);
  }

  tree.load(nodes);

  // Start with the first line
  const line = lines[0];
  let end = line.vertices[line.vertices.length - 1];
  const new_lines = [line];
  for (let i = 0; i < lines.length - 1; i++) {
    const [nearest] = knn(tree, end[0], end[1], 1);
    // If the end point was closest, we reverse the vertices
    const line = lines[nearest.index];
    if (nearest.isEnd) {
      line.vertices.reverse();
    }
    end = line.vertices[line.vertices.length - 1];
    new_lines.push(line);

    // Remove nodes for the start and end points from the tree
    tree.remove(nearest);
    tree.remove(nearest.partner);
  }
  return new_lines;
}

export function mergeNearby(
  lines,
  { mergeThreshold = config.mergeThreshold } = {}
) {
  const thresholdSquared = mergeThreshold ** 2;

  lines = lines.filter(({ vertices }) => vertices.length);

  let line = lines[0];
  let end = line.vertices[line.vertices.length - 1];
  const new_lines = [line];
  for (let i = 1; i < lines.length; i++) {
    const { vertices } = lines[i];

    if (vec2.sqrDist(vertices[0], end) <= thresholdSquared) {
      line.vertices.push(...vertices.slice(1));
    } else {
      line = lines[i];
      new_lines.push(line);
    }

    end = vertices[vertices.length - 1];
  }

  return new_lines;
}
