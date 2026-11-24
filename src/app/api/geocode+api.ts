const SEARCH_URL = "https://geocode.maps.co/search";

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length > 200) {
    return Response.json({ error: "INVALID_QUERY" }, { status: 400 });
  }

  const apiKey = process.env.GEOCODE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: "GEOCODING_NOT_CONFIGURED" }, { status: 500 });
  }

  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    extratags: "0",
  }).toString();

  const timeout = AbortSignal.timeout(8_000);
  try {
    const upstream = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Accept-Language": "sv,en;q=0.8",
      },
      signal: AbortSignal.any([request.signal, timeout]),
    });
    if (!upstream.ok) {
      const status = upstream.status === 429 ? 429 : 502;
      return Response.json({ error: "GEOCODING_FAILED" }, { status });
    }

    return new Response(upstream.body, {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    const status = timeout.aborted ? 504 : 503;
    return Response.json({ error: "GEOCODING_UNAVAILABLE" }, { status });
  }
}
