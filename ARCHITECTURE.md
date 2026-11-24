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
weatherRepository (resolve location, fetch and save forecast)
      ↓
geocode.maps.co through the Expo API route (only for place names)
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

AsyncStorage holds the latest parsed forecast for each location ID. After a successful city search, the repository also saves the normalized query and its resolved location ID. That mapping allows a repeat search to find the correct forecast after a restart when geocoding is unavailable.

On a connectivity error or timeout, the repository reads the saved forecast for the resolved location or, if geocoding failed, the saved ID for the exact normalized query. The screen shows the saved forecast together with the error and retry button. Without a matching entry, it shows the error. A cancelled request cannot update the screen.

## Folder ownership

| Area | Files | Primary owner | Review partner |
|---|---|---|---|
| Models and external contracts | `src/models/`, `src/parsers/` | Data lead | UI lead |
| Network / repository / local cache | `src/services/`, `src/repositories/`, `src/storage/` | Data lead | UI lead |
| Navigation / views / design | `app/`, `src/components/` | UI lead | Data lead |
| Hooks and app integration | `src/hooks/` | Shared | Shared |
| Tests / docs / oral prep | `tests/`, docs, SPEC | Shared | Shared |

## Shared data contract
`src/models/Weather.ts` defines the **application** model, independent from external API field names. `geocodingParser.ts` maps geocode.maps.co results to `Location`, and `weatherParser.ts` maps Open-Meteo JSON to `WeatherForecast`.

## Selected API field mapping (proposed)

| Open-Meteo field | App model |
|---|---|
| `current.time`, `current.temperature_2m`, `current.weather_code`, `current.wind_speed_10m` | `CurrentWeather` |
| `daily.time`, `temperature_2m_min`, `temperature_2m_max`, `weather_code`, `precipitation_sum` | `DailyForecast` |
| `hourly.time`, `temperature_2m`, `weather_code`, `precipitation`, `wind_speed_10m` | `HourlyForecast` |

Daily/hourly fields are parallel arrays in the API: validate their lengths, handle documented nullable values, then group hourly records by local date. Request `timezone=auto` and `forecast_days=7`.

## API notes
- Weather: `https://api.open-meteo.com/v1/forecast` with chosen `current`, `daily`, `hourly` variables.
- Place search uses the international option in the assignment, `geocode.maps.co`. The Expo API route sends the server's `GEOCODE_MAPS_API_KEY` in the upstream Authorization header. The client sends only the search text to the Expo route.
- During development KTH's SMHI-format proxy can be used if you implement the SMHI interface; the **final build must call a real API**.

## Error and state rules
- `idle`: nothing selected yet.
- `loading`: request underway; identify which city is being loaded in UI.
- `success`: live forecast, or a saved forecast with `isStale` and the request error.
- `error`: show a readable error when the request has no usable forecast.
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
- Is the same cached day's hourly forecast sufficient for detail and today views?
- Which UI preference besides refresh interval is simplest and useful? (Theme or temperature units.)
- When is the oral presentation scheduled? Submission must be at least one day before it.
