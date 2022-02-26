import RBush from "rbush";
import knn from "rbush-knn";

import config from "./config";
import type { Line } from "./line";

interface RTreeNode {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  index: number;
  isEnd: boolean;
  partner?: RTreeNode;
}

export function spatialSort(lines: Line[]): Line[] {
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

    const startNode: RTreeNode = {
      minX: start.x,
      minY: start.y,
      maxX: start.x,
      maxY: start.y,
      index: i,
      isEnd: false,
    };

    const endNode: RTreeNode = {
      minX: end.x,
      minY: end.y,
      maxX: end.x,
      maxY: end.y,
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
    const [nearest] = knn(tree, end.x, end.y, 1);
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

interface MergeOptions {
  mergeThreshold?: number;
}

export function mergeNearby(
  lines: Line[],
  { mergeThreshold = config.mergeThreshold }: MergeOptions = {}
): Line[] {
  const thresholdSquared = mergeThreshold ** 2;

  lines = lines.filter(({ vertices }) => vertices.length);

  if (!lines.length) {
    return lines;
  }

  let line = lines[0];
  let end = line.vertices[line.vertices.length - 1];
  const new_lines = [line];
  for (let i = 1; i < lines.length; i++) {
    const { vertices, color } = lines[i];

    if (
      line.color.equals(color) &&
      vertices[0].sqrDist(end) <= thresholdSquared
    ) {
      line.vertices.push(...vertices.slice(1));
    } else {
      line = lines[i];
      new_lines.push(line);
    }

    end = vertices[vertices.length - 1];
  }

  return new_lines;
}
