# Weather App

An Expo, React Native and TypeScript weather application.

## Project structure

```text
src/
├── app/          # Expo Router screens and layouts
├── models/       # Application-owned domain models
├── components/   # Reusable UI components
├── context/      # Weather and application preferences providers
├── hooks/        # Shared state and app hooks
├── services/     # API integrations
├── parsers/      # External JSON validation and transformation
├── repositories/ # Coordination of API access and persistence
└── storage/      # Local forecasts, favorites, and settings
tests/            # Automated tests for the data layer
```

The UI uses domain models from `src/models/` and does not depend directly on
raw API responses. API-specific JSON is validated and transformed by parser
modules before it reaches the screens.

`useWeather` delegates city lookups and forecast requests to
`weatherRepository`. A city search sends the place name to the Expo API
route at `/api/geocode`. That route calls geocode.maps.co, and the repository
passes the resolved coordinates to Open-Meteo. The repository saves successful forecasts through
`weatherStorage` and falls back to the saved forecast for the selected
location when a request cannot connect or times out. A coordinate search
sends validated coordinates directly to the forecast service.
While the user types a city name, `/api/city-suggestions` returns names and
regions. Selecting a suggestion sends the qualified place name to `/api/geocode`.

## Development

Create a key at [geocode.maps.co](https://geocode.maps.co/). Set it in the
git-ignored `.env.local` file at the project root:

```dotenv
GEOCODE_MAPS_API_KEY=your_key_here
```

The Expo server reads this value. It belongs in a server environment variable
with the name shown above. Install dependencies and start or restart the
Expo development server:

```bash
npm install
npm start
```

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm test
```

Routes are defined in `src/app/` using Expo Router.
Expo Go connects to the API route through the development server. A standalone
native release uses a deployed Expo server and the Expo Router plugin's
[`origin` setting](https://docs.expo.dev/router/web/api-routes/#native-deployment).
The [Android test report](docs/TEST_REPORT.md) contains the UI and data scenarios.
