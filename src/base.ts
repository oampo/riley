export function checkState(cond: boolean, msg?: string): asserts cond {
  if (!cond) {
    throw new Error(msg == null ? "Invalid state" : msg);
  }
}

export function checkExists(x: null | undefined, msg?: string): never;
export function checkExists<T>(x: T | null | undefined, msg?: string): T;
export function checkExists<T>(x: T | null | undefined, msg?: string): T {
  if (x == null) {
    throw new Error(msg == null ? "Unexpected nullish value" : msg);
  }
  return x;
}

export class UnreachableError extends Error {
  constructor(x: never) {
    super(`Unhandled case: ${JSON.stringify(x)}`);
  }
}
