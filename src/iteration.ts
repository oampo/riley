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
