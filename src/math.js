export function mapRange(value, fromStart, fromStop, toStart, toStop) {
  const fromRange = fromStop - fromStart;
  const toRange = toStop - toStart;
  return toStart + (toRange * (value - fromStart)) / fromRange;
}
