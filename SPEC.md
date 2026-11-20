# Weather App — SPEC.md

## 1. AI meta-instructions
- Read `SPEC.md` and `ARCHITECTURE.md` before proposing code changes.
- Use TypeScript, React Native and Expo. Keep implementation consistent with the course PDF.
- Explain the purpose and trade-offs of each important change. Prefer hints and reviews for core parsing, state, and error-handling logic.
- Do not mark requirements complete unless a student has verified them and can explain the corresponding code.
- Do not invent test results, session logs or personal reflections. Students must record real outcomes themselves.
- Do not write the students' reflection for them.
- Keep source code, comments and submission documents in English. Discuss concepts in Swedish if helpful.
- At the end of each session remind us to update requirement statuses, decisions, oral-question map and our own process log.

## 2. Project facts
- Course/lab: Lab B:2 — Building a Native Weather App
- Platform: React Native + Expo + TypeScript
- Group: two students
- Target: all basic requirements; aim for higher grade through quality, not feature count
- Weather provider: Open-Meteo (planned)
- Place search: one of the geocoding options approved in the assignment; confirm provider/key and terms before coding
- Device testing: physical Android device and/or official emulator (browser does not count)
- Submission: one reflection report with appendices A–D, at least one day before the scheduled oral presentation
- Prerequisite: Lab B:1 must be passed

## 3. Requirements checklist
Status values: TODO / IN PROGRESS / VERIFIED. All initially TODO.

| ID | Requirement | Status | Owner | Code/test evidence |
|---|---|---|---|---|
| W-01 | User can search by place name through a geocoding API | TODO | Data lead | |
| W-02 | User can enter valid latitude/longitude coordinates; invalid inputs are rejected | TODO | Data lead | |
| W-03 | Forecast fetched from Open-Meteo or SMHI | TODO | Data lead | |
| W-04 | Home shows current conditions and visual weather information for next 7 days | TODO | UI lead | |
| W-05 | Today has hourly detail and remaining days have a daily overview | TODO | Shared | |
| W-06 | Selecting a day opens a detail screen with temperature, condition and extra weather data | TODO | UI lead | |
| W-07 | Scrollable forecast list | TODO | UI lead | |
| W-08 | Add/remove favourite locations and access them in a dedicated view | TODO | Shared | |
| W-09 | Settings screen changes refresh interval and a UI preference | TODO | Shared | |
| W-10 | Parsed forecast is cached locally after successful retrieval | TODO | Data lead | |
| W-11 | Offline: no crash, clear error, show last successful forecast if available | TODO | Data lead | |
| W-12 | Portrait and landscape orientations both work | TODO | UI lead | |
| W-13 | JSON parsing is implemented in a separate parser module | TODO | Data lead | |
| W-14 | Network work is asynchronous and does not block UI | TODO | Data lead | |
| W-15 | API, timeout, parsing and network errors have explicit UI states | TODO | Shared | |
| W-16 | Automated tests cover at least 2 of: JSON parsing, error-state logic, data transformation | TODO | Shared | |
| W-17 | At least 20 distinct UX scenarios documented (start state, action, expected result) | TODO | Shared | |
| W-18 | App and tests verified on physical device or official emulator | TODO | Shared | |
| W-19 | Networking, transformation, state and UI are separated clearly | TODO | Shared | |
| W-20 | Visual hierarchy, spacing, loading/error states are deliberately designed | TODO | UI lead | |
| W-21 | Both students can justify decisions and trace code at oral presentation | TODO | Shared | |
| W-22 | README describes code organization, responsibilities and connections | TODO | Shared | |
| W-23 | SPEC includes IDs, AI instructions and session updates | TODO | Shared | |
| W-24 | LLM_PROCESS contains real per-session AI interactions and student evaluations | TODO | Each student | |
| W-25 | Reflection and appendices A–D prepared as specified | TODO | Shared / personal reflection | |

## 4. Component specifications (write before implementing)
### `Location`
- Purpose: identify one place from city search or coordinate input.
- Inputs: place name/coordinate result; outputs: validated location.
- Edge cases: no search results, duplicate names, latitude outside [-90, 90], longitude outside [-180, 180], NaN.
- Requirements: W-01, W-02.

### `weatherApi.ts`
- Purpose: fetch a 7-day Open-Meteo response; no UI code.
- Inputs: valid coordinates; output: external JSON DTO.
- Edge cases: timeout, non-2xx status, offline, missing fields.
- Requirements: W-03, W-14, W-15.

### `weatherParser.ts`
- Purpose: validate API payload and convert into app-owned `WeatherForecast` model.
- Inputs: unknown JSON + selected location + fetch timestamp; output: model or explicit error.
- Edge cases: missing fields, inconsistent array lengths, empty days, null optional values, hourly timestamps/date grouping.
- Requirements: W-05, W-13, W-16.

### `weatherRepository.ts`
- Purpose: coordinate API request, parsing, caching and cached fallback.
- Inputs: Location; output: fresh forecast or cached forecast with stale flag.
- Edge cases: first launch offline, offline after a successful fetch, cache from another location.
- Requirements: W-10, W-11, W-19.

### `useWeather.ts`
- Purpose: represent idle/loading/success/error state and avoid outdated search responses overriding newer searches.
- Inputs: search request; output: observable UI state.
- Edge cases: two quick searches, cancellation, retry.
- Requirements: W-15, W-19.

### Screens
- Home: city/coordinate search, current conditions, seven-day list.
- Details: selected day's forecast and hourly data.
- Favourites: saved places.
- Settings: refresh interval and UI preferences.
- Requirements: W-04 through W-09, W-12, W-20.

## 5. Architecture and data contract
See `ARCHITECTURE.md` and `src/models/Weather.ts`.
- UI depends on app-domain models, **not** raw Open-Meteo JSON.
- API layer returns raw DTOs; parser validates and transforms; repository controls cache; hook handles screen state.
- UI lead may use fixture `WeatherForecast` objects while data lead builds services.
- No secrets/API keys in Git; confirm geocoding choice and how keys are managed before integration.
- Units inside models: Celsius, km/h and mm. UI conversion is separate.

## 6. Decision log
| Date | Decision | Reason | Status |
|---|---|---|---|
| 2026-11-20 | Use Expo / TypeScript | Familiar from Lab B:1 and permitted by assignment | Proposed — confirm together |
| 2026-11-20 | Use Open-Meteo | No weather API key in course option | Proposed — confirm together |
| 2026-11-20 | Separate domain models from external DTOs | Testability and parallel team work | Proposed — confirm together |
| 2026-11-20 | Select geocoding provider before implementation | Assignment lists providers; maps.co now documents an API-key requirement | Open |

## 7. Oral exam map
Opening question Q26: show the AI meta-instructions above, pick a W-ID and locate its implementation.

| Question group | Important code | Tests / evidence | Owner of explanation |
|---|---|---|---|
| Q1–6 Data/networking | weatherApi, parser, repository | | Both |
| Q7–12 State | useWeather, screens | | Both |
| Q13–18 Errors | repository, useWeather, error UI | | Both |
| Q19–24 Architecture | ARCHITECTURE, all layers | | Both |
| Q25–30 AI process | SPEC, LLM_PROCESS, actual changes | | Both |

## 8. Implementation milestones
1. Agree on domain models and architecture; start SPEC and logs.
2. Geocoding + weather API + parser; Home skeleton with mock data.
3. Integrate Home, details and hourly/daily forecasts.
4. Favourites, settings, persistence.
5. Offline handling, concurrency and orientation.
6. Automated tests, 20 UX scenarios, device verification.
7. Polish, README, personal reflection, oral rehearsal and final submission.

## 9. Session log — student-maintained
| Date | What was actually implemented | Tested? | Open questions | Who worked on it |
|---|---|---|---|---|
| | | | | |

## 10. End-of-session checklist
- [ ] Explain what we changed and why.
- [ ] Run relevant tests; record observed outcomes (never assume pass).
- [ ] Update verified W-IDs and link evidence.
- [ ] Record architecture decisions and trade-offs.
- [ ] Add code locations to oral question map.
- [ ] Each student updates their actual LLM_PROCESS contributions.
- [ ] Each student keeps their own notes for the reflection.

## 11. Submission packaging
- Reflection report (~half a page) written by students, not AI.
- Appendix A: test report including actual results, automated test files, and 20 UX scenarios.
- Appendix B: project-root README.md.
- Appendix C: this living SPEC.md.
- Appendix D: LLM_PROCESS.md written/maintained by students.
- Code reviewed during oral presentation, not submitted separately per assignment.

Note: The course PDF's appendix contains leftover N-Back examples; the weather requirements on pages 2–4 govern this project.
