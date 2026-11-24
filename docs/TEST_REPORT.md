# Android weather app test report

## Test setup

- Run the app on a physical Android device or the official Android Emulator.
- Set `GEOCODE_MAPS_API_KEY` in the project's `.env.local` and restart Expo before running the city search scenarios.
- Enable auto-rotate and connect the phone and computer to the same Wi-Fi network. Start Expo from the project folder with `npx.cmd expo start --go` on Windows. Use Expo Go for SDK 58 and scan the terminal QR code.
- Record the test date, device model, Android version and Git revision. If there are local changes, note those as well.
- Use the Swedish button labels in the steps below. A scenario's starting state can be set up independently of the other scenarios.
- Replace **Not run** with **Pass**, **Fail** or **Blocked** after each test. Record the actual behavior in the last column. For failures, include the steps, orientation and any error message.

## UI scenarios

| ID | Area | Starting state | Steps | Expected result | Android result and observations |
| --- | --- | --- | --- | --- | --- |
| UI-01 | Navigation | **Hem** is open in portrait. | Open **Favoriter** and use the header back arrow. Open **Inställningar** and use Android Back. | The correct header appears on each screen. Both back actions return to **Hem**. | Not run |
| UI-02 | Day details | A forecast is visible on **Hem**. | Tap a future day. Compare its date and temperatures with the row you tapped, then go back. | **Dagsprognos** shows the same city, date and temperatures, plus the weather, precipitation and wind information. Back returns to the same city's forecast. | Not run |
| UI-03 | Add a favorite | Stockholm's forecast is visible and Stockholm is absent from **Favoriter**. | Tap **Spara som favorit**, open **Favoriter**, then go back to **Hem**. | Stockholm appears once in **Favoriter**. Its forecast on **Hem** now has a **Ta bort favorit** button. | Not run |
| UI-04 | Open a favorite | Stockholm is saved and Malmö's forecast is visible on **Hem**. | Open **Favoriter** and tap **Öppna prognos** for Stockholm. | The app returns to **Hem** and loads Stockholm's forecast. The forecast card and day details refer to Stockholm. | Not run |
| UI-05 | Remove a favorite | Stockholm is the only entry in **Favoriter**. | Tap **Ta bort**. Return to **Hem** and display Stockholm's forecast. | The entry disappears, the empty-state text appears, and Stockholm can be saved again from **Hem**. | Not run |
| UI-06 | Local persistence | A place is saved in **Favoriter**. Fahrenheit and **60 min** are selected in **Inställningar**. | Close and reopen the app. Check **Favoriter** and **Inställningar**. | The saved place remains and both selected settings are restored. | Not run |
| UI-07 | Temperature unit | A forecast is visible on **Hem** in Celsius. | Note a temperature. Select **Fahrenheit (°F)** in **Inställningar**. Return to **Hem**, check the weather card, hourly cards and daily list, then open a day. Switch back to Celsius and check again. | All temperature displays use °F after the first change and °C after switching back. For example, 10 °C becomes 50 °F. Precipitation stays in mm and wind stays in km/h. | Not run |
| UI-08 | Automatic refresh | A forecast is loaded and the current interval is longer than 15 minutes. | Open the **Network** tab in React Native DevTools. Select **15 min**, return to **Hem**, and keep the app open in the foreground. Record the time from selection until the next request to Open-Meteo's forecast endpoint. | After about 15 minutes, a new forecast request is made for the coordinates of the same place without a new search. | Not run |
| UI-09 | Home and details rotation | A forecast is visible on **Hem** in portrait. | Scroll vertically to the daily list and swipe the hourly cards horizontally. Rotate to landscape and repeat. Open a day in landscape, check all its details, and rotate back to portrait. | Home stays scrollable in both directions where applicable. The same day stays open after rotation. Text, controls and the back arrow remain reachable in both orientations. | Not run |
| UI-10 | Favorites and settings rotation | At least one place is saved. **Favoriter** is open in portrait. | Rotate **Favoriter** to landscape and open a saved place. From **Hem**, open **Inställningar** in landscape and select a different temperature unit. Rotate back to portrait. | The favorite can be opened in landscape. Settings are readable and tappable in both orientations. The selected unit remains selected after rotation. | Not run |

For UI-08, press `j` in the Expo terminal while the Android app is connected to open React Native DevTools. [Expo debugging tools](https://docs.expo.dev/debugging/tools/#inspecting-network-requests-expo-only)

## Data implementation

- The coordinate form accepts decimal commas and decimal points. The repository checks the latitude and longitude bounds before requesting a forecast directly from Open-Meteo.
- The repository stores the latest parsed forecast per location ID in AsyncStorage. It saves the normalized text of successful city searches so the same query can find the location offline, including after a restart.
- Connectivity errors and timeouts display a saved forecast when the cache contains the requested place. The UI shows the failure, a retry action, and the **Sparad prognos** notice. Successful retries replace the saved forecast.
- `npm test` covers forecast parsing, coordinate validation, repository error handling, cache isolation, and storage failures.
- The app uses geocode.maps.co for place-name search and Open-Meteo for forecasts. The Expo API route passes the server-side key to geocode.maps.co.

## Data verification

After the provider change on 2026-11-24, all 24 automated tests passed under Node.js 22.17.1. Expo lint, TypeScript checking and Expo exports for web and Android also passed.

All ten data scenarios passed in Chrome against the web export. The Malmö search used the Expo route to obtain live coordinates from geocode.maps.co and then fetched a seven-day forecast from Open-Meteo. The offline checks blocked the app's geocoding route and the forecast endpoint while keeping the app reachable. Page reloads exercised persisted forecasts. The network log confirmed direct forecasts for valid coordinates and no forecast requests for invalid coordinates. The API key was absent from the export artifacts.

After adding suggestions, all 28 automated tests passed. A live Chrome check covered partial names for Malmö and Tokyo, selecting Springfield in Illinois from two same-name suggestions, clearing outdated suggestions, and recovering the selected Malmö forecast offline after a reload. A manual search also succeeded with the suggestions endpoint blocked. The web and Android exports passed.

Android device or emulator verification is pending. The Android result column records that run separately.

## Data scenarios

Use an installed Android build for offline restart scenarios. When using Expo Go, keep Metro reachable over the local network and interrupt access to geocode.maps.co and Open-Meteo. Record the Android result in the last column.

| ID | Area | Starting state | Steps | Expected result | Android result and observations |
| --- | --- | --- | --- | --- | --- |
| DATA-01 | City suggestions and search | **Hem** is open and geocode.maps.co and Open-Meteo are reachable. | Type **Malm** and tap **Malmö, Skåne län, Sverige** in the suggestions. | The list shows names and regions while typing. After selection it closes and Malmö appears with the current weather, today's hourly forecast, and the seven-day forecast. | Not run |
| DATA-02 | Unknown city | A forecast is open and geocode.maps.co is reachable. | Search for **zzzzxqvnonexistentplace**. | The app reports that the place could not be found. The previous city's forecast clears. | Not run |
| DATA-03 | Valid coordinates | **Hem** is open and the app is online. | Enter **59,3293** for latitude and **18.0686** for longitude. Tap **Sök med koordinater**. | The forecast appears for the submitted coordinates with current weather and seven forecast days. | Not run |
| DATA-04 | Invalid coordinates | **Hem** is open. | Search with latitude **91** and longitude **18**, then latitude **59** and longitude **-181**. | Each search shows the error next to its coordinate field group. If the Network tab is open, neither action issues a forecast request. | Not run |
| DATA-05 | Cached startup | Start the app online and wait for Stockholm's live forecast. | Close the app, interrupt access to Open-Meteo, then reopen it. | Stockholm's saved forecast appears with **Sparad prognos**, a connection error, and **Försök igen**. | Not run |
| DATA-06 | Cached city search | Search for **Malmö** online and wait for its forecast. | Restart with geocode.maps.co and Open-Meteo unreachable. On **Hem**, search for **malmö** again. | The forecast is marked as saved and belongs to Malmö. | Not run |
| DATA-07 | Uncached city | A forecast for Stockholm is saved, and no forecast for Umeå has been saved. | Make geocode.maps.co and Open-Meteo unreachable and search for **Umeå**. | The app shows a connection error and a retry action. The forecast area stays empty. | Not run |
| DATA-08 | Reconnect and retry | **Hem** is showing a saved forecast with a connection error. | Restore access to geocode.maps.co and Open-Meteo and tap **Försök igen**. | A fresh forecast for the same place replaces the saved forecast. The saved notice and connection error clear. | Not run |
| DATA-09 | Cached day details | **Hem** is showing a saved forecast. | Tap one of the forecast days. | The selected place and date appear in **Dagsprognos** with the **Sparad prognos** notice. | Not run |
| DATA-10 | Cached coordinates | Fetch a forecast for **59.3293, 18.0686** online. | Restart with Open-Meteo unreachable, then search for the same coordinates using decimal commas. | The saved forecast matches those coordinates and is marked as saved. | Not run |
