import { parseCitySuggestions } from "../../parsers/citySuggestionsParser";

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 3 || query.length > 200) return Response.json([]);

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name: query,
    count: "10",
    language: "sv",
    format: "json",
  }).toString();

  try {
    const upstream = await fetch(url, {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(5_000)]),
    });
    if (upstream.ok) {
      return Response.json(parseCitySuggestions(await upstream.json()));
    }
  } catch {
    // The regular city search is still available if suggestions fail.
  }

  return Response.json([], { status: 503 });
}
