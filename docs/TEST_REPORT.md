# Android UI test report

## Test setup

- Run the app on a physical Android device or the official Android Emulator.
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
