import type { CitySuggestion } from "../models/Weather";

export function parseCitySuggestions(data: unknown): CitySuggestion[] {
  const results = (data as { results?: unknown } | null)?.results;
  if (!Array.isArray(results)) return [];

  const suggestions: CitySuggestion[] = [];
  const seen = new Set<string>();

  for (const item of results as unknown[]) {
    if (suggestions.length === 5) break;
    if (!item || typeof item !== "object") continue;

    const { name: rawName, admin1, country, feature_code } = item as Record<string, unknown>;
    if (typeof rawName !== "string" || !rawName.trim()) continue;
    if (typeof feature_code === "string" && !feature_code.startsWith("PPL")) continue;

    const name = rawName.trim();
    const nameKey = name.toLocaleLowerCase("sv-SE");
    const qualifiers = [admin1, country]
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value !== "" && value.toLocaleLowerCase("sv-SE") !== nameKey);
    const uniqueQualifiers = [...new Set(qualifiers)];
    const context = uniqueQualifiers.join(", ");
    const query = [name, ...uniqueQualifiers.filter((value) =>
      !value.toLocaleLowerCase("sv-SE").startsWith(`${nameKey} `)
    )].join(", ");
    const key = query.toLocaleLowerCase("sv-SE");
    if (seen.has(key)) continue;

    seen.add(key);
    suggestions.push({ name, context, query });
  }

  return suggestions;
}
