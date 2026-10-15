declare module "rbush-knn" {
  import type RBush from "rbush";
  export default function knn<T>(
    tree: RBush<T>,
    x: number,
    y: number,
    n: number,
    filterFn?: (t: T) => number,
    maxDistance?: number,
  ): T[];
}
