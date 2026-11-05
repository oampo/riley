import { checkExists } from "./base";

export function* pairs<T>(iterable: Iterable<T>): IterableIterator<[T, T]> {
  let prev: T | undefined;
  let hasPrev = false;

  for (const current of iterable) {
    if (hasPrev) {
      yield [prev!, current];
    }
    prev = current;
    hasPrev = true;
  }
}

export function* wrappingPairs<T>(
  iterable: Iterable<T>,
): IterableIterator<[T, T]> {
  let first: T | undefined;
  let prev: T | undefined;
  let hasPair = false;

  for (const current of iterable) {
    if (prev == null) {
      first = current;
    } else {
      yield [prev, current];
      hasPair = true;
    }
    prev = current;
  }

  if (hasPair) {
    yield [checkExists(prev), checkExists(first)];
  }
}

export function range(stop: number): IterableIterator<number>;
export function range(
  start: number,
  stop: number,
  step?: number,
): IterableIterator<number>;
export function* range(
  startOrStop: number,
  stop?: number,
  step: number = 1,
): IterableIterator<number> {
  const start = stop != null ? startOrStop : 0;
  stop = stop != null ? stop : startOrStop;
  for (let i = start; i < stop; i += step) {
    yield i;
  }
}

export function distribute(
  spacing: number,
  length: number,
  padding: number = 0,
): { count: number; it: IterableIterator<number> } {
  length -= 2 * padding;
  const n = Math.floor(length / spacing) + 1;

  function* positions(): IterableIterator<number> {
    if (n <= 0) return;

    if (n === 1) {
      yield padding + length / 2;
      return;
    }
    const totalInnerGap = (n - 1) * spacing;
    const edgeGap = padding + (length - totalInnerGap) / 2;
    for (const i of range(n)) {
      yield edgeGap + i * spacing;
    }
  }

  return {
    count: n,
    it: positions(),
  };
}

export const enum DistributeSpacing {
  BETWEEN = "between",
  AROUND = "around",
  EVENLY = "evenly",
}

export function* distributeN(
  n: number,
  length: number,
  padding: number = 0,
  spacing: DistributeSpacing = DistributeSpacing.BETWEEN,
): IterableIterator<number> {
  if (n <= 0) {
    return;
  }
  length -= 2 * padding;

  if (n === 1) {
    yield padding + length / 2;
    return;
  }

  switch (spacing) {
    case DistributeSpacing.BETWEEN: {
      // First and last items sit at 0 and length.
      const step = length / (n - 1);
      for (const i of range(n)) {
        yield padding + i * step;
      }
      break;
    }
    case DistributeSpacing.EVENLY: {
      // All gaps (including edges) are equal.
      const step = length / (n + 1);
      for (const i of range(n)) {
        yield padding + (i + 1) * step;
      }
      break;
    }
    case DistributeSpacing.AROUND: {
      // Edge gaps are half the size of the gaps between items.
      const step = length / n;
      for (const i of range(n)) {
        yield padding + (i + 0.5) * step;
      }
      break;
    }
  }
}

export function* entries<T>(
  iterable: Iterable<T>,
): IterableIterator<[number, T]> {
  let i = 0;
  for (const item of iterable) {
    yield [i++, item];
  }
}
