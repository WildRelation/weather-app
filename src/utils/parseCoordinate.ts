export function parseCoordinate(input: string, limit: number): number | null {
  const text = input.trim().replace(",", ".");

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) {
    return null;
  }

  const value = Number(text);
  return Math.abs(value) <= limit ? value : null;
}
