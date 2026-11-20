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
- Väderleverantör: Open-Meteo (planerat)
- Platssökning: ett av de geocoding-alternativ som godkänns i uppgiften; kontrollera leverantör, API-nyckel och villkor före implementation
- Testning på enhet: fysisk Android-enhet och/eller officiell emulator (webbläsare räknas inte)
- Inlämning: en reflektionsrapport med bilagor A–D, minst en dag före bokad muntlig presentation
- Förkunskapskrav: Lab B:1 måste vara godkänd

## 3. Kravchecklista
Statusvärden: TODO / PÅGÅR / VERIFIERAT. Alla har från början status TODO.

| ID | Krav | Status | Ansvarig | Underlag i kod/test |
|---|---|---|---|---|
| W-01 | Användaren kan söka efter platsnamn via ett geocoding-API | TODO | Dataansvarig | |
| W-02 | Användaren kan ange giltiga koordinater (latitud/longitud); ogiltiga värden avvisas | TODO | Dataansvarig | |
| W-03 | Prognos hämtas från Open-Meteo eller SMHI | TODO | Dataansvarig | |
| W-04 | Startsidan visar aktuellt väder och visuell väderinformation för de kommande sju dagarna | TODO | UI-ansvarig | |
| W-05 | Dagens väder visas timvis och resterande dagar i en dagsöversikt | TODO | Gemensamt | |
| W-06 | Val av dag öppnar detaljskärm med temperatur, väderförhållanden och ytterligare väderdata | TODO | UI-ansvarig | |
| W-07 | Prognosen visas i en scrollbar lista | TODO | UI-ansvarig | |
| W-08 | Användaren kan lägga till/ta bort favoritplatser och öppna dem i en separat vy | TODO | Gemensamt | |
| W-09 | En inställningsskärm låter användaren ändra uppdateringsintervall och en UI-inställning | TODO | Gemensamt | |
| W-10 | Parsad prognos sparas lokalt efter lyckad hämtning | TODO | Dataansvarig | |
| W-11 | Offline: ingen krasch, tydligt felmeddelande och senast lyckade prognos visas om den finns | TODO | Dataansvarig | |
| W-12 | Appen fungerar både i stående och liggande läge | TODO | UI-ansvarig | |
| W-13 | JSON-parsning implementeras i en separat parsermodul | TODO | Dataansvarig | |
| W-14 | Nätverksanrop sker asynkront och blockerar inte användargränssnittet | TODO | Dataansvarig | |
| W-15 | API-fel, timeout, parsningsfel och nätverksfel har tydliga UI-tillstånd | TODO | Gemensamt | |
| W-16 | Automatiserade tester täcker minst två av: JSON-parsning, felhanteringslogik, datatransformation | TODO | Gemensamt | |
| W-17 | Minst 20 olika UX-scenarier dokumenteras (startläge, åtgärd, förväntat resultat) | TODO | Gemensamt | |
| W-18 | Appen och testerna verifieras på fysisk enhet eller officiell emulator | TODO | Gemensamt | |
| W-19 | Nätverk, datatransformation, state och UI är tydligt separerade | TODO | Gemensamt | |
| W-20 | Visuell hierarki, avstånd samt laddnings- och feltillstånd har genomtänkt design | TODO | UI-ansvarig | |
| W-21 | Båda studenterna kan motivera beslut och följa kodflöden vid muntlig presentation | TODO | Gemensamt | |
| W-22 | README beskriver kodens organisation, ansvarsområden och hur delarna hänger ihop | TODO | Gemensamt | |
| W-23 | SPEC innehåller krav-ID:n, AI-instruktioner och uppdateringar efter arbetspass | TODO | Gemensamt | |
| W-24 | LLM_PROCESS innehåller faktiska AI-interaktioner per arbetspass och studenternas bedömningar | TODO | Varje student | |
| W-25 | Reflektion och bilagor A–D sammanställs enligt instruktionerna | TODO | Gemensamt / egen reflektion | |

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
- Indata: `Location`; utdata: färsk prognos eller cachad prognos med markering att den är gammal.
- Gränsfall: första starten offline, offline efter en tidigare lyckad hämtning, cache för en annan plats.
- Krav: W-10, W-11, W-19.

### `useWeather.ts`
- Syfte: representera idle/loading/success/error och hindra äldre sökresultat från att skriva över nyare.
- Indata: sökbegäran; utdata: observerbart UI-state.
- Gränsfall: två snabba sökningar, avbrytning, nytt försök.
- Krav: W-15, W-19.

### Skärmar
- Home: sökning på stad/koordinater, aktuellt väder och lista över sju dagar.
- Details: vald dags prognos och timdata.
- Favourites: sparade platser.
- Settings: uppdateringsintervall och UI-inställningar.
- Krav: W-04 till W-09, W-12, W-20.

## 5. Arkitektur och datakontrakt
Se `ARCHITECTURE.md` och `src/models/Weather.ts`.
- UI använder appens egna datamodeller, **inte** rå JSON från Open-Meteo.
- API-lagret returnerar råa DTO:er; parsern validerar och transformerar; repository hanterar cache; hooken hanterar skärmens state.
- UI-ansvarig får använda tillfälliga `WeatherForecast`-objekt medan dataansvarig bygger tjänsterna.
- Lägg inte hemligheter eller API-nycklar i Git; bekräfta val av geocoding och hantering av nycklar före integration.
- Enheter i modellerna: Celsius, km/h och mm. Omvandling i UI görs separat.

## 6. Beslutslogg
| Datum | Beslut | Motivering | Status |
|---|---|---|---|
| 2026-11-20 | Använd Expo / TypeScript | Bekant från Lab B:1 och tillåtet i uppgiften | Föreslaget – bekräfta tillsammans |
| 2026-11-20 | Använd Open-Meteo | Inget krav på API-nyckel för kursens väder-API-alternativ | Föreslaget – bekräfta tillsammans |
| 2026-11-20 | Separera interna datamodeller från externa DTO:er | Testbarhet och möjlighet att arbeta parallellt | Föreslaget – bekräfta tillsammans |
| 2026-11-20 | Välj geocoding-leverantör innan implementation | Uppgiften anger olika leverantörer; maps.co dokumenterar numera krav på API-nyckel | Öppet |

## 7. Koppling till muntliga frågor
Inledande fråga Q26: visa AI-instruktionerna ovan, välj ett W-ID och hitta implementationen i koden.

| Frågegrupp | Viktig kod | Tester / underlag | Vem ska kunna förklara? |
|---|---|---|---|
| Q1–6 Data/nätverk | weatherApi, parser, repository | | Båda |
| Q7–12 State | useWeather, skärmar | | Båda |
| Q13–18 Fel | repository, useWeather, felmeddelanden i UI | | Båda |
| Q19–24 Arkitektur | ARCHITECTURE, alla lager | | Båda |
| Q25–30 AI-process | SPEC, LLM_PROCESS, faktiska ändringar | | Båda |

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
