import { useEffect, useState } from "react";

import type { CitySuggestion } from "../models/Weather";
import { getCitySuggestions } from "../services/searchCityApi";

export function useCitySuggestions(query: string) {
  const [result, setResult] = useState<{ query: string; suggestions: CitySuggestion[] } | null>(null);

  useEffect(() => {
    if (query.length < 3 || query.length > 200) return;

    const controller = new AbortController();
    const { signal } = controller;
    const timer = setTimeout(async () => {
      const suggestions = await getCitySuggestions(query, signal).catch(() => []);
      if (!signal.aborted) setResult({ query, suggestions });
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return result?.query === query ? result.suggestions : [];
}
