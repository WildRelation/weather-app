const assert = require("node:assert/strict");
const { test } = require("node:test");
const axios = require("axios");

const { GET: citySuggestionsRoute } = require("../.expo/data-tests/app/api/city-suggestions+api.js");
const { GET: geocodeRoute } = require("../.expo/data-tests/app/api/geocode+api.js");
const { parseCitySuggestions } = require("../.expo/data-tests/parsers/citySuggestionsParser.js");
const { parseGeocodingResult } = require("../.expo/data-tests/parsers/geocodingParser.js");
const { parseWeather } = require("../.expo/data-tests/parsers/weatherParser.js");
const { defaultLocation, loadWeather } = require("../.expo/data-tests/repositories/weatherRepository.js");
const { createWeatherStorage } = require("../.expo/data-tests/storage/weatherStorage.js");
const { parseCoordinate } = require("../.expo/data-tests/utils/parseCoordinate.js");

const stockholm = defaultLocation;
const malmo = { id: "2692969", name: "Malmö", latitude: 55.605, longitude: 13.0038 };
const coordinates = { id: "coordinates:0,-45", name: "0, -45", latitude: 0, longitude: -45 };
const fetchedAt = "2026-11-24T11:00:00Z";

function forecastResponse() {
  const dates = Array.from({ length: 7 }, (_, i) => `2026-11-${24 + i}`);
  const times = dates.flatMap((date) => [`${date}T00:00`, `${date}T12:00`]);

  return {
    timezone: "Europe/Stockholm",
    current: { time: "2026-11-24T12:00", temperature_2m: 4, weather_code: 3, wind_speed_10m: null },
    hourly: {
      time: times,
      temperature_2m: times.map((_, index) => index),
      weather_code: times.map(() => 3),
      precipitation: times.map(() => null),
      wind_speed_10m: times.map(() => 8),
    },
    daily: {
      time: dates,
      temperature_2m_min: dates.map(() => 2),
      temperature_2m_max: dates.map(() => 7),
      weather_code: dates.map(() => 3),
      precipitation_sum: dates.map(() => null),
    },
  };
}

function createStore() {
  const records = new Map();
  return {
    records,
    async getItem(key) {
      return records.get(key) ?? null;
    },
    async setItem(key, value) {
      records.set(key, value);
    },
  };
}

function mockApi(t, { geocode = () => stockholm, forecast = forecastResponse } = {}) {
  const previousAdapter = axios.defaults.adapter;
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (path) => {
    const url = new URL(path, "http://app.test");
    assert.equal(url.pathname, "/api/geocode");
    const query = url.searchParams.get("q");
    requests.push({ host: url.hostname, query });
    const match = geocode(query);
    if (match instanceof Response) return match;
    return Response.json(match ? [mapsCoResult(match)] : []);
  };
  axios.defaults.adapter = async (config) => {
    const host = new URL(config.url).hostname;
    requests.push({ host, params: config.params });
    assert.equal(host, "api.open-meteo.com");
    const data = await forecast(config);
    return { config, data, status: 200, statusText: "OK", headers: {} };
  };
  t.after(() => {
    axios.defaults.adapter = previousAdapter;
    globalThis.fetch = previousFetch;
  });
  return requests;
}

function mapsCoResult(location) {
  return {
    place_id: 5,
    osm_type: "relation",
    osm_id: location.id,
    name: location.name,
    display_name: `${location.name}, Sverige`,
    lat: String(location.latitude),
    lon: String(location.longitude),
    address: { country: "Sverige" },
  };
}

function mockGeocodeServer(t, key, fetchMock) {
  const previousKey = process.env.GEOCODE_MAPS_API_KEY;
  const previousFetch = globalThis.fetch;
  if (key === undefined) delete process.env.GEOCODE_MAPS_API_KEY;
  else process.env.GEOCODE_MAPS_API_KEY = key;
  globalThis.fetch = fetchMock;
  t.after(() => {
    if (previousKey === undefined) delete process.env.GEOCODE_MAPS_API_KEY;
    else process.env.GEOCODE_MAPS_API_KEY = previousKey;
    globalThis.fetch = previousFetch;
  });
}

function offline() {
  throw new axios.AxiosError("No connection", "ERR_NETWORK");
}

function load(request, storage, signal = new AbortController().signal) {
  return loadWeather(request, storage, signal);
}

test("maps the seven days, groups local hours and retains optional nulls", () => {
  const forecast = parseWeather(forecastResponse(), stockholm, fetchedAt);
  assert.equal(forecast.location, stockholm);
  assert.equal(forecast.timezone, "Europe/Stockholm");
  assert.equal(forecast.fetchedAt, fetchedAt);
  assert.equal(forecast.current.windSpeedKmh, null);
  assert.equal(forecast.days.length, 7);
  assert.equal(forecast.days[0].precipitationSumMm, null);
  assert.deepEqual(
    forecast.days[1].hours.map(({ time, temperatureC, precipitationMm }) => [time, temperatureC, precipitationMm]),
    [["2026-11-25T00:00", 2, null], ["2026-11-25T12:00", 3, null]],
  );
});

test("rejects missing or malformed required current weather", () => {
  assert.throws(() => parseWeather(null, stockholm, fetchedAt), /current weather/);
  const source = forecastResponse();
  source.current.temperature_2m = null;
  assert.throws(() => parseWeather(source, stockholm, fetchedAt), /current weather/);
  source.current.temperature_2m = 4;
  source.current.time = "bad date";
  assert.throws(() => parseWeather(source, stockholm, fetchedAt), /current weather/);
});

test("rejects mismatched hourly arrays and malformed hourly values", () => {
  const source = forecastResponse();
  source.hourly.weather_code.pop();
  assert.throws(() => parseWeather(source, stockholm, fetchedAt), /hourly forecast series/);
  source.hourly.weather_code.push("3");
  assert.throws(() => parseWeather(source, stockholm, fetchedAt), /hourly forecast/);
});

test("rejects incorrect daily counts and dates", () => {
  const source = forecastResponse();
  source.daily.time.pop();
  assert.throws(() => parseWeather(source, stockholm, fetchedAt), /seven-day forecast series/);
  source.daily.time.push("2026-12-01");
  assert.throws(() => parseWeather(source, stockholm, fetchedAt), /daily forecast/);
  source.daily.time[6] = "2026-11-31";
  assert.throws(() => parseWeather(source, stockholm, fetchedAt), /daily forecast/);
});

test("validates decimal commas, the coordinate boundaries, and malformed input", () => {
  assert.equal(parseCoordinate(" 59,3293 ", 90), 59.3293);
  assert.equal(parseCoordinate("0", 90), 0);
  assert.equal(parseCoordinate("-90", 90), -90);
  assert.equal(parseCoordinate("+180", 180), 180);
  assert.equal(parseCoordinate("-180", 180), -180);
  for (const value of ["", "NaN", "Infinity", "59°", "1e1", "90.01", "-90.01"]) {
    assert.equal(parseCoordinate(value, 90), null);
  }
  assert.equal(parseCoordinate("180.01", 180), null);
});

test("parses maps.co coordinates and uses the persistent OSM object ID", () => {
  const item = mapsCoResult(malmo);
  const result = parseGeocodingResult([item]);
  assert.deepEqual(result, { ...malmo, id: "osm:relation:2692969", country: "Sverige" });
  assert.equal(parseGeocodingResult([{ ...item, place_id: 8, name: undefined }]).name, "Malmö");
  assert.equal(parseGeocodingResult([{ ...item, place_id: 8 }]).id, result.id);
  assert.equal(parseGeocodingResult([]), null);
  assert.throws(() => parseGeocodingResult({ results: [] }), /Invalid geocoding response/);
  assert.throws(() => parseGeocodingResult([{ ...item, lat: "91" }]), /Invalid location/);
  assert.throws(() => parseGeocodingResult([{ ...item, lon: "" }]), /Invalid location/);
});

test("city suggestions keep distinct regions and omit redundant geography from lookups", () => {
  const suggestions = parseCitySuggestions({
    results: [
      { name: "Tokyo", admin1: "Tokyo prefektur", country: "Japan", feature_code: "PPLC" },
      { name: "Springfield", admin1: "Illinois", country: "USA", feature_code: "PPL" },
      { name: "Springfield", admin1: "Missouri", country: "USA", feature_code: "PPL" },
      { name: "Springfield", admin1: "Illinois", country: "USA", feature_code: "PPL" },
      { name: "Mount Springfield", feature_code: "MT" },
    ],
  });
  assert.deepEqual(suggestions, [
    { name: "Tokyo", context: "Tokyo prefektur, Japan", query: "Tokyo, Japan" },
    { name: "Springfield", context: "Illinois, USA", query: "Springfield, Illinois, USA" },
    { name: "Springfield", context: "Missouri, USA", query: "Springfield, Missouri, USA" },
  ]);
  assert.deepEqual(parseCitySuggestions({}), []);
});

test("the suggestions route skips short text and returns at most five place names without coordinates", async (t) => {
  const previousFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = previousFetch; });
  const requests = [];
  globalThis.fetch = async (url) => {
    requests.push(url);
    return Response.json({
      results: Array.from({ length: 10 }, (_, i) => ({
        name: `Malmö ${i}`, country: "Sverige", latitude: 55, longitude: 13, feature_code: "PPL",
      })),
    });
  };

  const short = await citySuggestionsRoute(new Request("http://app.test/api/city-suggestions?q=Ma"));
  assert.deepEqual(await short.json(), []);
  assert.equal(requests.length, 0);
  const response = await citySuggestionsRoute(new Request("http://app.test/api/city-suggestions?q=+Malm+"));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].hostname, "geocoding-api.open-meteo.com");
  assert.equal(requests[0].searchParams.get("name"), "Malm");
  const suggestions = await response.json();
  assert.equal(suggestions.length, 5);
  assert.deepEqual(suggestions[0], { name: "Malmö 0", context: "Sverige", query: "Malmö 0, Sverige" });
});

test("the server sends the maps.co credential in the authorization header", async (t) => {
  const expected = [mapsCoResult(malmo)];
  let outgoing;
  mockGeocodeServer(t, "fake-test-key", async (url, options) => {
    outgoing = { url, options };
    return Response.json(expected);
  });

  const incoming = new Request("http://app.test/api/geocode?q=Malm%C3%B6%2C+SE");
  const response = await geocodeRoute(incoming);
  assert.equal(outgoing.url.origin, "https://geocode.maps.co");
  assert.equal(outgoing.url.pathname, "/search");
  assert.equal(outgoing.url.searchParams.get("q"), "Malmö, SE");
  assert.equal(outgoing.url.searchParams.has("api_key"), false);
  assert.equal(outgoing.options.headers.Authorization, "Bearer fake-test-key");
  assert.deepEqual(await response.json(), expected);
});

test("the geocoding route stops before contacting maps.co without a query or key", async (t) => {
  let requests = 0;
  mockGeocodeServer(t, undefined, async () => {
    requests += 1;
    return Response.json([]);
  });
  const invalid = await geocodeRoute(new Request("http://app.test/api/geocode?q=%20"));
  assert.equal(invalid.status, 400);
  const noKey = await geocodeRoute(new Request("http://app.test/api/geocode?q=Malm%C3%B6"));
  assert.equal(noKey.status, 500);
  assert.deepEqual(await noKey.json(), { error: "GEOCODING_NOT_CONFIGURED" });
  assert.equal(requests, 0);
});

test("a city lookup sends the resolved coordinates to the existing forecast service", async (t) => {
  const requests = mockApi(t, { geocode: () => malmo });
  const result = await load({ cityName: " Malmö, SE " }, createWeatherStorage(createStore()));
  assert.equal(result.forecast.location.name, "Malmö");
  assert.deepEqual(requests[0], { host: "app.test", query: "Malmö, SE" });
  assert.equal(requests[1].host, "api.open-meteo.com");
  assert.equal(requests[1].params.latitude, malmo.latitude);
  assert.equal(requests[1].params.longitude, malmo.longitude);
});

test("selecting a suggestion resolves its full place name and preserves the chosen display name", async (t) => {
  const requests = mockApi(t, { geocode: () => ({ name: "東京都", id: "1543125", latitude: 35.68, longitude: 139.69 }) });
  const result = await load({ cityName: "Tokyo", searchQuery: "Tokyo, Japan" }, createWeatherStorage(createStore()));
  assert.equal(requests[0].query, "Tokyo, Japan");
  assert.equal(requests[1].params.latitude, 35.68);
  assert.equal(result.forecast.location.name, "Tokyo");
});

test("selected places with the same name use separate offline aliases", async (t) => {
  const illinois = { name: "Springfield", id: "126326", latitude: 39.8, longitude: -89.64 };
  const missouri = { name: "Springfield", id: "142678", latitude: 37.21, longitude: -93.29 };
  let disconnected = false;
  const chicagoRegion = { cityName: "Springfield", searchQuery: "Springfield, Illinois, USA" };
  const missouriRegion = { cityName: "Springfield", searchQuery: "Springfield, Missouri, USA" };
  mockApi(t, { geocode: (query) => disconnected ? offline() : query.includes("Illinois") ? illinois : missouri });
  const storage = createWeatherStorage(createStore());
  await load(chicagoRegion, storage);
  await load(missouriRegion, storage);
  disconnected = true;

  assert.equal((await load(chicagoRegion, storage)).forecast.location.latitude, illinois.latitude);
  assert.equal((await load(missouriRegion, storage)).forecast.location.latitude, missouri.latitude);
  assert.equal((await load({ cityName: "Springfield" }, storage)).forecast.location.latitude, missouri.latitude);
});

test("a missing server key reports that city search is unavailable and coordinates still work", async (t) => {
  mockApi(t, { geocode: () => Response.json({}, { status: 500 }) });
  const storage = createWeatherStorage(createStore());
  const result = await load({ cityName: "Malmö" }, storage);
  assert.equal(result.error.code, "API_ERROR");
  assert.match(result.error.message, /koordinater/);
  assert.equal((await load({ location: coordinates }, storage)).status, "success");
});

test("coordinates go straight to the forecast endpoint and are saved by location", async (t) => {
  const requests = mockApi(t);
  const storage = createWeatherStorage(createStore());
  const result = await load({ location: coordinates }, storage);

  assert.equal(result.status, "success");
  assert.equal(result.isStale, false);
  assert.deepEqual(result.forecast.location, coordinates);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].host, "api.open-meteo.com");
  assert.equal(requests[0].params.latitude, 0);
  assert.equal(requests[0].params.longitude, -45);
  assert.equal(requests[0].params.timezone, "auto");
  assert.equal(requests[0].params.forecast_days, 7);
  assert.deepEqual(await storage.readByLocation(coordinates.id), result.forecast);
});

test("invalid coordinates and blank city names are rejected before network calls", async (t) => {
  const requests = mockApi(t);
  const storage = createWeatherStorage(createStore());
  for (const location of [
    { ...coordinates, latitude: NaN },
    { ...coordinates, latitude: -91 },
    { ...coordinates, longitude: 181 },
    { ...coordinates, longitude: Infinity },
  ]) {
    const result = await load({ location }, storage);
    assert.equal(result.status, "error");
    assert.equal(result.error.code, "INVALID_INPUT");
  }
  assert.equal((await load({ cityName: "  " }, storage)).error.code, "INVALID_INPUT");
  assert.equal(requests.length, 0);
});

test("a known location loads its saved forecast offline after recreating storage", async (t) => {
  let disconnected = false;
  mockApi(t, { forecast: () => disconnected ? offline() : forecastResponse() });
  const store = createStore();
  const fresh = await load({ location: coordinates }, createWeatherStorage(store));
  disconnected = true;
  const result = await load({ location: coordinates }, createWeatherStorage(store));

  assert.equal(result.status, "success");
  assert.equal(result.isStale, true);
  assert.equal(result.error.code, "OFFLINE");
  assert.deepEqual(result.forecast, fresh.forecast);
});

test("a saved city query survives a restart and an offline geocoder", async (t) => {
  let disconnected = false;
  const requests = mockApi(t, {
    geocode: () => disconnected ? offline() : malmo,
    forecast: () => disconnected ? offline() : forecastResponse(),
  });
  const store = createStore();
  const fresh = await load({ cityName: "Malmö, SE" }, createWeatherStorage(store));

  disconnected = true;
  const saved = await load({ cityName: "  malmö, se " }, createWeatherStorage(store));
  assert.equal(saved.status, "success");
  assert.equal(saved.isStale, true);
  assert.equal(saved.error.code, "OFFLINE");
  assert.deepEqual(saved.forecast, fresh.forecast);
  assert.equal(requests.at(-1).host, "app.test");
});

test("the default city is available on a new offline startup and by its search name", async (t) => {
  let disconnected = false;
  mockApi(t, {
    geocode: () => disconnected ? offline() : stockholm,
    forecast: () => disconnected ? offline() : forecastResponse(),
  });
  const store = createStore();
  const fresh = await load({ cityName: null }, createWeatherStorage(store));
  disconnected = true;

  for (const cityName of [null, "stockholm"]) {
    const result = await load({ cityName }, createWeatherStorage(store));
    assert.equal(result.isStale, true);
    assert.deepEqual(result.forecast, fresh.forecast);
  }
});

test("offline searches never substitute the forecast of a different location", async (t) => {
  let disconnected = false;
  let geocoded = stockholm;
  mockApi(t, {
    geocode: () => geocoded,
    forecast: () => disconnected ? offline() : forecastResponse(),
  });
  const storage = createWeatherStorage(createStore());
  await load({ cityName: "A place" }, storage);
  disconnected = true;
  geocoded = malmo;

  for (const request of [{ cityName: "A place" }, { location: malmo }]) {
    const result = await load(request, storage);
    assert.equal(result.status, "error");
    assert.equal(result.error.code, "OFFLINE");
    assert.equal(result.forecast, null);
  }
});

test("an unsuccessful city lookup returns PLACE_NOT_FOUND", async (t) => {
  const requests = mockApi(t, { geocode: () => null });
  const result = await load({ cityName: "Missing town" }, createWeatherStorage(createStore()));
  assert.equal(result.error.code, "PLACE_NOT_FOUND");
  assert.equal(result.forecast, null);
  assert.equal(requests.length, 1);
});

test("a timeout uses the same-location cache and retains the timeout reason", async (t) => {
  let timedOut = false;
  mockApi(t, {
    forecast: () => {
      if (timedOut) throw new axios.AxiosError("Timed out", "ECONNABORTED");
      return forecastResponse();
    },
  });
  const storage = createWeatherStorage(createStore());
  await load({ location: stockholm }, storage);
  timedOut = true;

  const cached = await load({ location: stockholm }, storage);
  assert.equal(cached.status, "success");
  assert.equal(cached.isStale, true);
  assert.equal(cached.error.code, "TIMEOUT");
  const uncached = await load({ location: malmo }, storage);
  assert.equal(uncached.status, "error");
  assert.equal(uncached.error.code, "TIMEOUT");
});

test("HTTP errors and malformed responses have distinct messages and keep the prior cache", async (t) => {
  let failure;
  mockApi(t, {
    forecast: () => {
      if (failure === "http") throw new axios.AxiosError("HTTP 503", "ERR_BAD_RESPONSE");
      if (failure === "parsing") return { current: null };
      return forecastResponse();
    },
  });
  const storage = createWeatherStorage(createStore());
  const original = await load({ location: stockholm }, storage);

  failure = "http";
  assert.equal((await load({ location: stockholm }, storage)).error.code, "API_ERROR");
  failure = "parsing";
  assert.equal((await load({ location: stockholm }, storage)).error.code, "INVALID_RESPONSE");
  assert.deepEqual(await storage.readByLocation(stockholm.id), original.forecast);
});

test("offline with no saved forecast returns the network error", async (t) => {
  mockApi(t, { geocode: offline, forecast: offline });
  const storage = createWeatherStorage(createStore());
  for (const request of [{ cityName: "Malmö" }, { location: coordinates }]) {
    const result = await load(request, storage);
    assert.equal(result.status, "error");
    assert.equal(result.error.code, "OFFLINE");
    assert.equal(result.forecast, null);
  }
});

test("a successful retry replaces the saved forecast and clears the stale state", async (t) => {
  let disconnected = false;
  let temperature = 4;
  mockApi(t, {
    forecast: () => {
      if (disconnected) return offline();
      const response = forecastResponse();
      response.current.temperature_2m = temperature;
      return response;
    },
  });
  const storage = createWeatherStorage(createStore());
  const request = { location: stockholm };
  await load(request, storage);
  disconnected = true;
  assert.equal((await load(request, storage)).isStale, true);

  disconnected = false;
  temperature = 6;
  const retried = await load(request, storage);
  assert.equal(retried.isStale, false);
  assert.equal(retried.error, null);
  assert.equal(retried.forecast.current.temperatureC, 6);
  assert.deepEqual(await storage.readByLocation(stockholm.id), retried.forecast);
});

test("unreadable and corrupt cache entries are treated as cache misses", async (t) => {
  mockApi(t, { forecast: offline });
  const store = createStore();
  const key = `weather-app:forecast:v1:${stockholm.id}`;
  for (const value of ["{bad JSON", "{}", JSON.stringify({ location: stockholm, days: [null] })]) {
    store.records.set(key, value);
    const result = await load({ location: stockholm }, createWeatherStorage(store));
    assert.equal(result.error.code, "OFFLINE");
    assert.equal(result.forecast, null);
  }

  const unavailable = createWeatherStorage({
    ...store,
    async getItem() { throw new Error("Storage unavailable"); },
  });
  assert.equal((await load({ location: stockholm }, unavailable)).error.code, "OFFLINE");
});

test("failed storage writes still allow live data and subsequent successful writes", async (t) => {
  mockApi(t);
  let failWrite = true;
  const store = createStore();
  const storage = createWeatherStorage({
    ...store,
    async setItem(key, value) {
      if (failWrite) throw new Error("Storage unavailable");
      return store.setItem(key, value);
    },
  });

  const fresh = await load({ location: stockholm }, storage);
  assert.equal(fresh.status, "success");
  assert.equal(await storage.readByLocation(stockholm.id), null);
  failWrite = false;
  const second = await load({ location: stockholm }, storage);
  assert.deepEqual(await storage.readByLocation(stockholm.id), second.forecast);
});

test("a cancelled forecast request produces no result or cache entry", async (t) => {
  const controller = new AbortController();
  mockApi(t, {
    forecast: () => {
      controller.abort();
      return forecastResponse();
    },
  });
  const store = createStore();
  const result = await load({ location: stockholm }, createWeatherStorage(store), controller.signal);
  assert.equal(result, null);
  assert.equal(store.records.size, 0);
});
