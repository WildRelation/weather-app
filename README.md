# Weather App

An Expo, React Native and TypeScript weather application.

## Project structure

```text
src/
├── app/          # Expo Router screens and layouts
├── models/       # Application-owned domain models
├── components/   # Reusable UI components
├── hooks/        # Shared state and app hooks
├── services/     # API integrations
├── parsers/      # External JSON validation and transformation
├── repositories/ # Coordination of API access and persistence
├── storage/      # Local persistence
└── __tests__/    # Automated tests
```

The UI uses domain models from `src/models/` and does not depend directly on
raw API responses. API-specific JSON is validated and transformed by parser
modules before it reaches the screens.

## Development

Install dependencies and start the Expo development server:

```bash
npm install
npm start
```

Useful checks:

```bash
npm run lint
npx tsc --noEmit
```

Routes are defined in `src/app/` using Expo Router.
