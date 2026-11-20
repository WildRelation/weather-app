# Weather App — proposed architecture

> Draft for both lab partners to review before implementation.

## Goal
Build a small, explainable React Native/Expo application with separate responsibilities for networking, JSON parsing, persistence, state and screens. This is a lightweight MVVM-inspired structure, not a complex enterprise architecture.

## Data flow

```text
User types place name or coordinates
      ↓
Home screen (View) → useWeather (state / ViewModel)
      ↓
Geocoding service (only for place names)
      ↓
weatherRepository (coordinates → weather request)
      ↓
weatherApi (fetch raw Open-Meteo JSON)
      ↓
weatherParser (validate + map to WeatherForecast)
      ↓
weatherStorage (save successful forecast by location)
      ↓
useWeather sets success/error/loading state
      ↓
Home / Details render typed domain models
```

If the network fails: check local cache for the **same location**, return an explicitly stale forecast if found; otherwise show a meaningful error and no blank screen. Loading a new city must not misleadingly label the previous city's data as new. Prevent slow earlier requests from overriding a more recent search.

## Folder ownership

| Area | Files | Primary owner | Review partner |
|---|---|---|---|
| Models and external contracts | `src/models/`, `src/parsers/` | Data lead | UI lead |
| Network / repository / local cache | `src/services/`, `src/repositories/`, `src/storage/` | Data lead | UI lead |
| Navigation / views / design | `app/`, `src/components/` | UI lead | Data lead |
| Hooks and app integration | `src/hooks/` | Shared | Shared |
| Tests / docs / oral prep | `__tests__/`, docs, SPEC | Shared | Shared |

## Shared data contract
`src/models/Weather.ts` defines the **application** model, independent from external API field names. Only `weatherParser.ts` knows the external JSON shape. The UI partner can make mock objects conforming to `WeatherForecast` without waiting for the API integration.

## Selected API field mapping (proposed)

| Open-Meteo field | App model |
|---|---|
| `current.time`, `current.temperature_2m`, `current.weather_code`, `current.wind_speed_10m` | `CurrentWeather` |
| `daily.time`, `temperature_2m_min`, `temperature_2m_max`, `weather_code`, `precipitation_sum` | `DailyForecast` |
| `hourly.time`, `temperature_2m`, `weather_code`, `precipitation`, `wind_speed_10m` | `HourlyForecast` |

Daily/hourly fields are parallel arrays in the API: validate their lengths, handle documented nullable values, then group hourly records by local date. Request `timezone=auto` and `forecast_days=7`.

## API notes
- Weather: `https://api.open-meteo.com/v1/forecast` with chosen `current`, `daily`, `hourly` variables.
- The assignment lists `geocode.maps.co` and SMHI autocomplete for place search. Current maps.co documentation requires an API key; choose the provider together, obtain key legally if needed, and keep it out of commits. Do not treat an Expo client key as a secret that cannot be extracted.
- During development KTH's SMHI-format proxy can be used if you implement the SMHI interface; the **final build must call a real API**.

## Error and state rules
- `idle`: nothing selected yet.
- `loading`: request underway; identify which city is being loaded in UI.
- `success`: complete forecast; `isStale` tells whether cached data is shown.
- `error`: show a readable error and optionally same-location cached forecast.
- Coordinate validation, empty geocoding results, HTTP failures, malformed JSON and timeouts have distinct test cases.

## Collaborating on GitHub
1. Both approve interface names/fields and the architecture diagram.
2. Data lead works on `feature/weather-api`; UI lead works on `feature/weather-ui` with mock data.
3. Open small pull requests and require the other partner to read/review them.
4. Meet to integrate the working search flow before proceeding to favourites/settings.
5. Each person explains one part written by the other at the end of each session.

## Planned tests
- Parser rejects missing required fields and mismatched arrays.
- Correct transformation of daily and hourly data into domain models.
- Error state/offline caching logic; cached location must match search location.
- At least 20 distinct UX interaction scenarios on a physical device or official simulator.

## Questions to resolve together
- Which approved geocoding option can be used reliably and with acceptable key handling?
- Is the same cached day's hourly forecast sufficient for detail and today views?
- Which UI preference besides refresh interval is simplest and useful? (Theme or temperature units.)
- When is the oral presentation scheduled? Submission must be at least one day before it.
