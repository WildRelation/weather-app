# Weather App — SPEC.md

## 1. AI-instruktioner
- Läs `SPEC.md` och `ARCHITECTURE.md` innan du föreslår kodändringar.
- Använd TypeScript, React Native och Expo. Se till att implementationen följer kursens PDF.
- Förklara syftet med och avvägningarna bakom viktiga ändringar. Ge helst ledtrådar och kodgranskning för kärnlogik kring parsning, state och felhantering.
- Markera inte krav som klara förrän en student har verifierat dem och kan förklara motsvarande kod.
- Hitta inte på testresultat, sessionsloggar eller personliga reflektioner. Studenterna ska själva dokumentera faktiska resultat.
- Skriv inte studenternas reflektion åt dem.
- Behåll källkod, kommentarer och inlämningsdokument på engelska. Diskutera gärna begrepp på svenska när det hjälper.
- Påminn oss efter varje arbetspass om att uppdatera kravstatus, beslut, kopplingen till muntliga frågor och vår egen processlogg.

## 2. Projektfakta
- Kurs/labb: Lab B:2 — Building a Native Weather App
- Plattform: React Native + Expo + TypeScript
- Grupp: två studenter
- Mål: uppfylla alla grundkrav och sikta på högre betyg genom kvalitet, inte fler funktioner
- Väderleverantör: Open-Meteo för aktuellt väder, timdata och sjudagarsprognos
- Platssökning: geocode.maps.co för internationella platser via en Expo-serverrutt
- Testning på enhet: fysisk Android-enhet och/eller officiell emulator (webbläsare räknas inte)
- Inlämning: en reflektionsrapport med bilagor A–D, minst en dag före bokad muntlig presentation
- Förkunskapskrav: Lab B:1 måste vara godkänd

## 3. Kravchecklista
`TODO` används för arbete som återstår. `PÅGÅR` används när det finns en implementation eller underlag som behöver gås igenom. Studenterna sätter `VERIFIERAT` efter egen kontroll och när de kan förklara relevant kod och testresultat.

| ID | Krav | Status | Ansvarig | Underlag i kod/test |
|---|---|---|---|---|
| W-01 | Användaren kan söka efter platsnamn via ett geocoding-API | PÅGÅR | Dataansvarig | `city-suggestions+api.ts`, `geocode+api.ts`, DATA-01–02. Valda stadsnamn löses till koordinater via geocode.maps.co enligt kurs-PDF:en, s. 2. |
| W-02 | Användaren kan ange giltiga koordinater (latitud/longitud); ogiltiga värden avvisas | PÅGÅR | Dataansvarig | `parseCoordinate.ts`, `weatherRepository.ts`, DATA-03–04. |
| W-03 | Prognos hämtas från Open-Meteo eller SMHI | PÅGÅR | Dataansvarig | `getWeather` i `weatherApi.ts` hämtar sju dagar i platsens tidszon. DATA-01 och DATA-03. |
| W-04 | Startsidan visar aktuellt väder och visuell väderinformation för de kommande sju dagarna | PÅGÅR | UI-ansvarig | `WeatherCard.tsx`, `ForecastList.tsx`, väderkoder i `weatherCondition.ts`. DATA-01. |
| W-05 | Dagens väder visas timvis och resterande dagar i en dagsöversikt | PÅGÅR | Gemensamt | `parseWeather` grupperar timmar per lokalt datum. `index.tsx` väljer dagens timmar och visar sjudagarsöversikten. DATA-01 och UI-09. |
| W-06 | Val av dag öppnar detaljskärm med temperatur, väderförhållanden och ytterligare väderdata | PÅGÅR | UI-ansvarig | `ForecastList.tsx` länkar till `forecast-day.tsx` med dagens värden. UI-02 och DATA-09. |
| W-07 | Prognosen visas i en scrollbar lista | PÅGÅR | UI-ansvarig | `index.tsx` har vertikal scroll och `HourlyForecastList.tsx` har horisontell scroll. UI-09. |
| W-08 | Användaren kan lägga till/ta bort favoritplatser och öppna dem i en separat vy | PÅGÅR | Gemensamt | `favorites.tsx`, `AppPreferencesContext.tsx`, `appPreferences.ts`. UI-03–06. |
| W-09 | En inställningsskärm låter användaren ändra uppdateringsintervall och en UI-inställning | PÅGÅR | Gemensamt | `settings.tsx` ställer in temperaturvisning och intervall. `useWeather.ts` använder intervallet. UI-06–08. |
| W-10 | Parsad prognos sparas lokalt efter lyckad hämtning | PÅGÅR | Dataansvarig | `weatherStorage.ts`, DATA-05 och DATA-10. |
| W-11 | Offline: ingen krasch, tydligt felmeddelande och senast lyckade prognos visas om den finns | PÅGÅR | Dataansvarig | `weatherRepository.ts`, `useWeather.ts`, DATA-05–10. |
| W-12 | Appen fungerar både i stående och liggande läge | PÅGÅR | UI-ansvarig | `app.json` tillåter rotation. UI-09–10 beskriver vad som ska kontrolleras i respektive läge. |
| W-13 | JSON-parsning implementeras i en separat parsermodul | PÅGÅR | Dataansvarig | `weatherParser.ts` och parserfallen i `npm test`. |
| W-14 | Nätverksanrop sker asynkront och blockerar inte användargränssnittet | PÅGÅR | Dataansvarig | `useWeather.ts` startar en asynkron hämtning med avbrytning. `weatherApi.ts` och `searchCityApi.ts` utför nätverksanropen. |
| W-15 | API-fel, timeout, parsningsfel och nätverksfel har tydliga UI-tillstånd | PÅGÅR | Gemensamt | `weatherRepository.ts`, `index.tsx` och felhanteringsfallen i `npm test`. |
| W-16 | Automatiserade tester täcker minst två av: JSON-parsning, felhanteringslogik, datatransformation | PÅGÅR | Gemensamt | `npm test` kör 28 fall i [weather.test.cjs](tests/weather.test.cjs), bland annat ogiltiga prognosserier, dygnsgruppering och offlinecache för rätt plats. |
| W-17 | Minst 20 olika UX-scenarier dokumenteras (startläge, åtgärd, förväntat resultat) | PÅGÅR | Gemensamt | 10 UI- och 10 datascenarier i [testrapporten](docs/TEST_REPORT.md). |
| W-18 | Appen och testerna verifieras på fysisk enhet eller officiell emulator | PÅGÅR | Gemensamt | En Androidkörning har rapporterats. Enhet, version och utfall per scenario dokumenteras i [testrapporten](docs/TEST_REPORT.md). |
| W-19 | Nätverk, datatransformation, state och UI är tydligt separerade | PÅGÅR | Gemensamt | [Arkitekturen](ARCHITECTURE.md) visar flödet mellan tjänster, parsrar, repository, state och vyer. |
| W-20 | Visuell hierarki, avstånd samt laddnings- och feltillstånd har genomtänkt design | PÅGÅR | UI-ansvarig | Väderkort, prognoslistor och tydliga laddnings-, fel- och offlinevyer. Underlag i UI-09 och DATA-05–09. |
| W-21 | Båda studenterna kan motivera beslut och följa kodflöden vid muntlig presentation | PÅGÅR | Gemensamt | [Frågor och svar inför muntan](docs/ORAL_EXAM_QA.md). Båda övar på att visa koden och svara med egna ord. |
| W-22 | README beskriver kodens organisation, ansvarsområden och hur delarna hänger ihop | PÅGÅR | Gemensamt | [README.md](README.md) beskriver mapparna och flödet från sökning till prognos och cache. |
| W-23 | SPEC innehåller krav-ID:n, AI-instruktioner och uppdateringar efter arbetspass | PÅGÅR | Gemensamt | Krav och AI-instruktioner finns här. Studenterna fyller i egna pass och verifieringar i avsnitt 9. |
| W-24 | LLM_PROCESS innehåller faktiska AI-interaktioner per arbetspass och studenternas bedömningar | PÅGÅR | Varje student | Avsnitt 9 samlar faktiska AI-assisterade uppgifter. Var och en behöver lägga in sina egna promptar och bedömningar i processloggen. |
| W-25 | Reflektion och bilagor A–D sammanställs enligt instruktionerna | PÅGÅR | Gemensamt / egen reflektion | [Testrapporten](docs/TEST_REPORT.md), [README](README.md) och SPEC finns som underlag för bilagorna A–C. Personliga reflektioner, processloggen och slutlig sammanställning återstår. |

### Kontroll inför inlämning

De automatiserade kontrollerna och webbläsartesterna finns i [testrapporten](docs/TEST_REPORT.md#data-verification). Alla 20 scenarier har startläge, steg och förväntat resultat. Androidkolumnen behöver fyllas i med studenternas faktiska körningar. Kontrollera stadsförslagen på den senaste versionen, rotationen och att rätt plats visas från cache efter omstart.

## 4. Komponentspecifikationer (skrivs före implementation)
### `Location`
- Syfte: identifiera en plats från stadssökning eller koordinatinmatning.
- Indata: platsnamn eller koordinatresultat; utdata: validerad plats.
- Gränsfall: inga sökresultat, flera platser med samma namn, latitud utanför [-90, 90], longitud utanför [-180, 180], NaN.
- Krav: W-01, W-02.

### `weatherApi.ts`
- Syfte: hämta ett 7-dagars svar från Open-Meteo; ingen UI-kod.
- Indata: giltiga koordinater; utdata: externt JSON-DTO.
- Gränsfall: timeout, HTTP-status utanför 2xx, offline, saknade fält.
- Krav: W-03, W-14, W-15.

### `weatherParser.ts`
- Syfte: validera API-svaret och omvandla det till appens egen modell `WeatherForecast`.
- Indata: okänd JSON, vald plats och hämtningstidpunkt; utdata: modell eller tydligt fel.
- Gränsfall: saknade fält, arrayer med olika längd, tomma dagar, null i valfria fält, gruppering av timvisa tidsstämplar per datum.
- Krav: W-05, W-13, W-16.

### `weatherRepository.ts`
- Syfte: samordna API-anrop, parsning, cachelagring och användning av cache vid fel.
- Tar en `WeatherRequest` med söktext eller en `Location`. Resultatet är en färsk prognos, en sparad prognos med felorsak eller ett fel utan prognos.
- Gränsfall: första starten offline, offline efter en tidigare lyckad hämtning, cache för en annan plats.
- Krav: W-10, W-11, W-19.

### `useWeather.ts`
- Syfte: representera idle/loading/success/error och hindra äldre sökresultat från att skriva över nyare.
- Indata: sökbegäran; utdata: observerbart UI-state.
- Gränsfall: två snabba sökningar, avbrytning, nytt försök.
- Krav: W-15, W-19.

### Skärmar
- Home: sökning på stad/koordinater, aktuellt väder och lista över sju dagar.
- Details visar dagens min och max, väderförhållande, nederbörd och högsta vind från timvärdena. Home visar dagens timlista.
- Favourites: sparade platser.
- Settings: uppdateringsintervall och UI-inställningar.
- Krav: W-04 till W-09, W-12, W-20.

## 5. Arkitektur och datakontrakt
Se [ARCHITECTURE.md](ARCHITECTURE.md) och [Weather.ts](src/models/Weather.ts).

- Vyerna läser appens egna modeller. Tjänsterna hämtar JSON, parsrarna validerar och omvandlar svaren, och repository samordnar hämtning och cache. `useWeather` hanterar skärmens tillstånd.
- Förslagsrutten returnerar ortsnamn med region och land. Det valda namnet löses till koordinater hos geocode.maps.co. Expo-servern läser nyckeln från sin miljö.
- Prognosmodellen lagrar Celsius, km/h och mm. `formatTemperature` omvandlar temperaturen vid visning.

## 6. Beslutslogg
| Datum | Beslut | Motivering | Status |
|---|---|---|---|
| 2026-11-20 | Använd Expo / TypeScript | Bekant från Lab B:1 och tillåtet i uppgiften | Föreslaget – bekräfta tillsammans |
| 2026-11-20 | Använd Open-Meteo | Inget krav på API-nyckel för kursens väder-API-alternativ | Föreslaget – bekräfta tillsammans |
| 2026-11-20 | Separera interna datamodeller från externa DTO:er | Testbarhet och möjlighet att arbeta parallellt | Föreslaget – bekräfta tillsammans |
| 2026-11-20 | Välj geocoding-leverantör innan implementation | Uppgiften anger olika leverantörer; maps.co dokumenterar krav på API-nyckel | Beslutat 2026-11-24 |
| 2026-11-24 | Spara prognos per plats-ID och behåll kopplingen från tidigare söktext till plats-ID | Samma plats kan öppnas offline efter omstart, även när platssökningen är otillgänglig | Implementerat |
| 2026-11-24 | Använd geocode.maps.co för platssökning och Open-Meteo för prognoser | Båda är listade för respektive uppgift på sida 2 i Lab B:2. API-nyckeln hanteras av Expo-servern. | Implementerat |
| 2026-11-24 | Visa stadsförslag efter minst tre tecken med region och land | En kort fördröjning minskar antalet anrop. Region och land skiljer orter med samma namn åt vid slutligt uppslag. | Implementerat |

## 7. Koppling till muntliga frågor
Börja med Q26. Visa AI-instruktionerna i avsnitt 1 och följ sedan ett W-ID till funktionen och ett test. Exemplet om W-11 och svaren på alla 30 frågor finns i [Frågor och svar inför muntan](docs/ORAL_EXAM_QA.md).

| Frågegrupp | Krav | Kod och underlag | Vem ska kunna förklara? |
|---|---|---|---|
| Q1–6 Data och nätverk | W-01–03, W-10–11, W-13–14 | `getWeather`, `parseWeather`, `loadWeather` och `createWeatherStorage`. Visa testet för sju dagar och lokala timmar. | Båda |
| Q7–12 Tillstånd | W-08–09, W-14–15 | `useWeather`, `WeatherProvider`, `AppPreferencesProvider`. Visa hur `requestForecast` sätter laddning och hur effekten avbryts. | Båda |
| Q13–18 Felhantering | W-10–11, W-15–16 | `getWeatherError`, `readByLocation` och `readByCity`. Visa testet som hindrar att en annan orts prognos visas offline. DATA-05–08. | Båda |
| Q19–24 Arkitektur | W-02, W-05–06, W-19, W-22 | `parseCoordinate`, `ForecastList`, `forecast-day.tsx` och [arkitekturen](ARCHITECTURE.md). | Båda |
| Q25–30 AI-process | W-16, W-21, W-23–24 | AI-instruktionerna ovan, ett faktiskt kodexempel, ett automatiserat test och den egna processloggen. | Båda |

## 8. Milstolpar för implementationen
1. Enas om datamodeller och arkitektur; påbörja SPEC och loggar.
2. Geocoding + väder-API + parser; grundläggande Home med testdata.
3. Koppla ihop Home, detaljer och tim-/dagsprognoser.
4. Favoriter, inställningar och lokal lagring.
5. Offline-hantering, samtidiga anrop och skärmrotation.
6. Automatiserade tester, 20 UX-scenarier och verifiering på enhet.
7. Slutjusteringar, README, personlig reflektion, muntlig övning och slutlig inlämning.

## 9. Sessionslogg – fylls i av studenterna
| Datum | Vad implementerades faktiskt? | Testat? | Öppna frågor | Vem arbetade med det? |
|---|---|---|---|---|
| | | | | |

### AI-stöd och tekniskt underlag 2026-11-24

Codex användes för uppgiften att validera och testa koordinatsökning, granska kurs-PDF:en, implementera offlinecache och ta fram automatiserade tester och tio datascenarier. Kodflödet går från `useWeather.ts` via `weatherRepository.ts` till API-tjänsterna, parsrarna och `weatherStorage.ts`. Körda kontroller och återstående Android-verifiering finns i [testrapporten](docs/TEST_REPORT.md).

Codex bytte även platssökningsleverantör till geocode.maps.co. `searchCityApi.ts` anropar Expo-serverrutten `geocode+api.ts`. Svaret omvandlas till `Location` innan koordinaterna skickas vidare till Open-Meteo.

Codex lade till klickbara stadsförslag med region och land. Förslagsrutten returnerar namn och regioner. Den valda orten slås upp hos geocode.maps.co innan prognosen hämtas.

## 10. Checklista efter varje arbetspass
- [ ] Förklara vad vi ändrade och varför.
- [ ] Kör relevanta tester och dokumentera observerade resultat (anta aldrig att ett test passerade).
- [ ] Uppdatera verifierade W-ID:n och länka underlag.
- [ ] Dokumentera arkitekturbeslut och avvägningar.
- [ ] Lägg till kodplatser i tabellen för muntliga frågor.
- [ ] Varje student uppdaterar sina faktiska bidrag i LLM_PROCESS.
- [ ] Varje student antecknar egna erfarenheter inför reflektionen.

## 11. Inlämningsmaterial
- Reflektionsrapport (cirka en halv sida), skriven av studenterna, inte av AI.
- Bilaga A: testrapport med faktiska resultat, automatiserade testfiler och 20 UX-scenarier.
- Bilaga B: README.md i projektets rotmapp.
- Bilaga C: detta levande SPEC.md.
- Bilaga D: LLM_PROCESS.md, som studenterna själva skriver och underhåller.
- Koden granskas under muntlig presentation och lämnas inte in separat enligt uppgiften.

Obs! Kurs-PDF:ens appendix innehåller kvarvarande N-Back-exempel; väderkraven på sidorna 2–4 gäller för det här projektet.
