export function isValidCoordinate(value: number, limit: number): boolean {
  return Number.isFinite(value) && Math.abs(value) <= limit;
}

export function parseCoordinate(input: string, limit: number): number | null {
  const text = input.trim().replace(",", ".");

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) {
    return null;
  }

  const value = Number(text);
  return isValidCoordinate(value, limit) ? value : null;
}
